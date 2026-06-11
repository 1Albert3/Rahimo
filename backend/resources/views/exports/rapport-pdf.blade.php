<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport Rahimo Transport</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #333; }
        h1 { font-size: 18px; color: #b91c1c; margin-bottom: 4px; }
        .subtitle { font-size: 11px; color: #666; margin-bottom: 16px; }
        .kpis { display: flex; gap: 12px; margin-bottom: 16px; }
        .kpi-box { border: 1px solid #ddd; padding: 8px 12px; border-radius: 4px; flex: 1; }
        .kpi-box .label { font-size: 8px; text-transform: uppercase; color: #999; }
        .kpi-box .value { font-size: 14px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f5f5f5; text-align: left; padding: 6px 8px; font-size: 8px; text-transform: uppercase; }
        td { padding: 5px 8px; border-bottom: 1px solid #eee; }
        .footer { margin-top: 20px; font-size: 8px; color: #999; text-align: center; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <h1>Rahimo Transport — Rapport {{ $periode === 'mensuel' ? 'Mensuel' : ($periode === 'trimestriel' ? 'Trimestriel' : 'Annuel') }}</h1>
    <p class="subtitle">Généré le {{ $dateGeneration }}</p>

    <div class="kpis">
        <div class="kpi-box">
            <div class="label">Recettes</div>
            <div class="value">{{ number_format($recettes, 0, ',', ' ') }} FCFA</div>
        </div>
        <div class="kpi-box">
            <div class="label">Dépenses</div>
            <div class="value">{{ number_format($depenses, 0, ',', ' ') }} FCFA</div>
        </div>
        <div class="kpi-box">
            <div class="label">Voyageurs</div>
            <div class="value">{{ number_format($totalVoyageurs, 0, ',', ' ') }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                @foreach($headers as $h)
                    <th>{{ $h }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{{ $cell }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Rahimo Transport — Rapport généré automatiquement le {{ $dateGeneration }}
    </div>
</body>
</html>
