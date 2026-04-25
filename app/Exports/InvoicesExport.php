<?php

namespace App\Exports;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InvoicesExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithTitle
{
    use Exportable;

    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function title(): string
    {
        return 'Invoices';
    }

    public function query()
    {
        $query = Invoice::query()->with(['category', 'uploadedBy'])->latest();
        $request = $this->request;

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('original_filename', 'like', "%{$search}%")
                    ->orWhere('number', 'like', "%{$search}%")
                    ->orWhere('supplier_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Invoice Number',
            'Filename',
            'Supplier',
            'Customer',
            'Issue Date',
            'Due Date',
            'Subtotal HT',
            'VAT Amount',
            'Total TTC',
            'Currency',
            'Status',
            'Category',
            'Uploaded By',
            'Created At',
        ];
    }

    public function map($invoice): array
    {
        return [
            $invoice->id,
            $invoice->number,
            $invoice->original_filename,
            $invoice->supplier_name,
            $invoice->customer_name,
            $invoice->issue_date?->format('Y-m-d'),
            $invoice->due_date?->format('Y-m-d'),
            $invoice->subtotal_ht,
            $invoice->vat_amount,
            $invoice->total_ttc,
            $invoice->currency,
            strtoupper($invoice->status ?? ''),
            $invoice->getRelation('category')?->name ?? '',
            $invoice->uploadedBy?->name ?? '',
            $invoice->created_at?->format('Y-m-d H:i'),
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 22,
            'C' => 32,
            'D' => 26,
            'E' => 26,
            'F' => 14,
            'G' => 14,
            'H' => 16,
            'I' => 14,
            'J' => 16,
            'K' => 10,
            'L' => 14,
            'M' => 22,
            'N' => 22,
            'O' => 18,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastCol = 'O';
        $headerRange = "A1:{$lastCol}1";

        // Header: indigo background, white bold text, centered
        $sheet->getStyle($headerRange)->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF4F46E5']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF4338CA']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(22);

        // Freeze header row and enable auto-filter
        $sheet->freezePane('A2');
        $sheet->setAutoFilter("A1:{$lastCol}1");

        // Numeric columns: right-align
        foreach (['H', 'I', 'J'] as $col) {
            $sheet->getStyle("{$col}2:{$col}10000")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        // Center ID, dates, currency, status, category
        foreach (['A', 'F', 'G', 'K', 'L'] as $col) {
            $sheet->getStyle("{$col}2:{$col}10000")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // Alternating row shading (light violet every other row)
        for ($row = 2; $row <= 10000; $row += 2) {
            $sheet->getStyle("A{$row}:{$lastCol}{$row}")
                ->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFF5F3FF');
        }

        // Outer border around the whole used range
        $sheet->getStyle("A1:{$lastCol}10000")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['argb' => 'FFE5E7EB']],
            ],
        ]);
    }
}
