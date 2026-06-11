<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Billet {{ $billet['booking_number'] }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 0; padding: 20px; color: #1a1c1c; }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 28px; font-weight: 900; color: #b70100; margin: 0; letter-spacing: -1px; }
        .badge { display: inline-block; background: #f0efef; padding: 4px 12px; border-radius: 999px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .main { border: 2px solid #e0dede; border-radius: 12px; padding: 24px; }
        .route { display: flex; justify-content: space-between; align-items: center; margin: 24px 0; }
        .city { text-align: center; }
        .city .code { font-size: 36px; font-weight: 900; }
        .city .name { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .arrow { flex: 1; text-align: center; font-size: 20px; color: #b70100; }
        .info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
        .info div { }
        .info .label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .info .value { font-size: 14px; font-weight: 700; margin-top: 2px; }
        .price { text-align: right; font-size: 24px; font-weight: 900; color: #b70100; margin-top: 16px; }
        .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #6b7280; }
        .qr { text-align: center; margin: 16px 0; }
        .separator { border: none; border-top: 1px dashed #d1d5db; margin: 16px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>RAHIMO</h1>
        <div class="badge">E-Ticket</div>
    </div>

    <div class="main">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:10px;color:#6b7280">N° {{ $billet['booking_number'] }}</div>
            <div style="font-size:10px;color:#6b7280">{{ $billet['booking_date'] }}</div>
        </div>

        <div class="route">
            <div class="city">
                <div class="code">{{ substr($billet['trip']['departure_city'] ?? '---', 0, 3) }}</div>
                <div class="name">{{ $billet['trip']['departure_city'] ?? '---' }}</div>
            </div>
            <div class="arrow">→</div>
            <div class="city">
                <div class="code">{{ substr($billet['trip']['arrival_city'] ?? '---', 0, 3) }}</div>
                <div class="name">{{ $billet['trip']['arrival_city'] ?? '---' }}</div>
            </div>
        </div>

        <hr class="separator">

        <div class="info">
            <div>
                <div class="label">Passager</div>
                <div class="value">{{ $billet['passenger_name'] }}</div>
            </div>
            <div>
                <div class="label">Sièges</div>
                <div class="value">{{ implode(', ', $billet['seat_numbers'] ?? []) }}</div>
            </div>
            <div>
                <div class="label">Départ</div>
                <div class="value">{{ $billet['trip']['departure_time'] ?? '--' }}</div>
            </div>
            <div>
                <div class="label">Arrivée</div>
                <div class="value">{{ $billet['trip']['arrival_time'] ?? '--' }}</div>
            </div>
            <div>
                <div class="label">Date</div>
                <div class="value">{{ $billet['trip']['departure_date'] ?? '--' }}</div>
            </div>
            <div>
                <div class="label">Durée</div>
                <div class="value">{{ $billet['trip']['duration'] ?? '--' }}</div>
            </div>
        </div>

        <hr class="separator">

        <div class="price">{{ number_format($billet['total_price'], 0, ',', ' ') }} FCFA</div>
    </div>

    <div class="footer">
        <p>Présentez ce billet (QR code) à l'entrée du véhicule.</p>
        <p>Rahimo Transport &mdash; Voyagez en toute confiance.</p>
    </div>
</body>
</html>