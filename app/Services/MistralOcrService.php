<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MistralOcrService
{
    private const string API_URL = 'https://api.mistral.ai/v1/ocr';
    private const string MODEL = 'mistral-ocr-latest';

    public function __construct(private string $apiKey)
    {
    }

    /**
     * Run OCR on a locally stored invoice file.
     * Returns the concatenated markdown text from all pages.
     */
    public function extractFromFile(string $filePath, string $mimeType): array
    {
        $absolutePath = Storage::disk('local')->path($filePath);
        $base64 = base64_encode(file_get_contents($absolutePath));
        $dataUrl = "data:{$mimeType};base64,{$base64}";

        $document = $this->isImage($mimeType)
            ? ['type' => 'image_url', 'image_url' => $dataUrl]
            : ['type' => 'document_url', 'document_url' => $dataUrl];

        Log::channel('mistral')->info('OCR request sent', [
            'file_path' => $filePath,
            'mime_type' => $mimeType,
            'model' => self::MODEL,
        ]);

        $response = Http::withToken($this->apiKey)
            ->timeout(120)
            ->when(app()->isLocal(), fn($http) => $http->withoutVerifying())
            ->post(self::API_URL, [
                'model' => self::MODEL,
                'document' => $document,
                'table_format' => 'markdown',
            ]);

        if ($response->failed()) {
            Log::channel('mistral')->error('OCR API request failed', [
                'file_path' => $filePath,
                'http_status' => $response->status(),
                'response' => $response->body(),
            ]);

            throw new \RuntimeException(
                'Mistral OCR API error ' . $response->status() . ': ' . $response->body()
            );
        }

        $data = $response->json();
        $pages = $data['pages'] ?? [];

        // Log full structure of first table entry so we can see the exact field names
        $firstTable = $pages[0]['tables'][0] ?? null;
        $firstTableDebug = $firstTable
            ? array_map(fn($v) => \is_string($v) && \strlen($v) > 300 ? \substr($v, 0, 300) . '…' : $v, $firstTable)
            : null;

        Log::channel('mistral')->info('OCR request succeeded', [
            'file_path'      => $filePath,
            'pages'          => \count($pages),
            'model_used'     => $data['model'] ?? self::MODEL,
            'page_keys'      => array_keys($pages[0] ?? []),
            'images_count'   => \count($pages[0]['images'] ?? []),
            'tables_count'   => \count($pages[0]['tables'] ?? []),
            'tables_ids'     => collect($pages[0]['tables'] ?? [])->pluck('id')->all(),
            'first_table'    => $firstTableDebug,
        ]);

        $fullText = collect($pages)
            ->map(fn($page) => $this->resolvePageMarkdown($page))
            ->filter()
            ->implode("\n\n---\n\n");

        Log::channel('mistral')->info('OCR full text result', [
            'file_path'   => $filePath,
            'page_count'  => \count($pages),
            'text_length' => \strlen($fullText),
            'ocr_text'    => $fullText,
        ]);

        return [
            'ocr_text'   => $fullText,
            'page_count' => \count($pages),
        ];
    }

    /**
     * Resolve a page's markdown by replacing [tbl-N.md](tbl-N.md) and
     * ![img-N.jpeg](img-N.jpeg) references with the actual content stored
     * in the page's images array (each entry may carry a `markdown` field).
     */
    private function resolvePageMarkdown(array $page): string
    {
        $markdown = trim($page['markdown'] ?? '');

        // Merge images + tables. Mistral stores table markdown in pages[i].tables,
        // images in pages[i].images — same reference syntax in the markdown text.
        // Try multiple field names since the API may use 'markdown', 'content', or 'text'.
        $embeds = collect([...($page['images'] ?? []), ...($page['tables'] ?? [])])
            ->mapWithKeys(function ($item) {
                $content = $item['markdown'] ?? $item['content'] ?? $item['text'] ?? '';
                return [$item['id'] => trim($content)];
            })
            ->filter() // drop entries with empty content
            ->all();

        foreach ($embeds as $id => $content) {
            // Match exact id: [tbl-0](tbl-0) or ![img-0.jpeg](img-0.jpeg)
            $markdown = preg_replace(
                '/!?\[' . preg_quote($id, '/') . '\]\(' . preg_quote($id, '/') . '\)/',
                $content,
                $markdown
            );

            // Also match id + ".md" suffix: id='tbl-0' → replace [tbl-0.md](tbl-0.md)
            if (!\str_ends_with($id, '.md')) {
                $idMd = $id . '.md';
                $markdown = preg_replace(
                    '/!?\[' . preg_quote($idMd, '/') . '\]\(' . preg_quote($idMd, '/') . '\)/',
                    $content,
                    $markdown
                );
            }
        }

        return $markdown;
    }

    private function isImage(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'image/');
    }
}
