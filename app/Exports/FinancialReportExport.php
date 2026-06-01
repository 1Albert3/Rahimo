<?php

namespace App\Exports;

use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class FinancialReportExport implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(
        public Carbon $dateFrom,
        public Carbon $dateTo,
    ) {}

    public function collection()
    {
        return collect([
            $this->revenueRow('Tickets (Billets)', Booking::whereBetween('created_at', [$this->dateFrom, $this->dateTo])
                ->where('status', 'confirmed')->sum('total_price')),
            $this->revenueRow('Colis', 0),
            $this->revenueRow('Parking', 0),
            $this->revenueRow('Location', 0),
            $this->revenueRow('Hébergement', 0),
            $this->revenueRow('Transport Moto', 0),
        ]);
    }

    private function revenueRow(string $label, float $amount): array
    {
        return [
            'cat' => $label,
            'amount' => $amount,
        ];
    }

    public function headings(): array
    {
        return [
            ['Rapport Financier', $this->dateFrom->format('d/m/Y') . ' - ' . $this->dateTo->format('d/m/Y')],
            [],
            ['Catégorie', 'Montant (FCFA)'],
        ];
    }

    public function title(): string
    {
        return 'Financier';
    }
}
