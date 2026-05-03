<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Services\InvoiceChatService;

class ChatController extends Controller
{
    private InvoiceChatService $chatService;

    public function __construct(InvoiceChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * POST /chat/ask
     */
    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|max:500',
            // Allowlist: only known page identifiers are accepted.
            // This is the first line of defence against prompt injection.
            'context'  => ['nullable', 'string', 'in:dashboard,invoices.index,suppliers.index,customers.index'],
        ]);

        $user = $request->user();
        if (!$user || !$user->tenant_id) {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        try {
            $response = $this->chatService->ask(
                $validated['question'], 
                $user->tenant_id,
                $validated['context'] ?? null
            );

            if (isset($response['error'])) {
                return response()->json(['error' => $response['error']], 400);
            }

            return response()->json(['answer' => $response['answer']]);

        } catch (\Exception $e) {
            Log::error('ChatController error: ' . $e->getMessage());
            return response()->json(['error' => 'Une erreur est survenue lors du traitement de votre demande.'], 500);
        }
    }
}
