<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificat de Formation</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0; padding: 0;
            background: #f8fafc;
        }
        .certificate {
            width: 100%; height: 100%;
            padding: 60px 80px;
            box-sizing: border-box;
            position: relative;
        }
        .border {
            border: 3px solid #1e40af;
            border-radius: 20px;
            padding: 50px;
            background: white;
            min-height: 500px;
            position: relative;
        }
        h1 {
            color: #1e40af;
            font-size: 28px;
            text-align: center;
            margin-top: 0;
            text-transform: uppercase;
            letter-spacing: 4px;
        }
        .subtitle {
            text-align: center;
            color: #64748b;
            font-size: 14px;
            margin-bottom: 40px;
        }
        .presented {
            text-align: center;
            color: #334155;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .employee {
            text-align: center;
            font-size: 36px;
            font-weight: bold;
            color: #0f172a;
            margin: 10px 0;
            letter-spacing: 2px;
        }
        .course-name {
            text-align: center;
            font-size: 22px;
            color: #1e40af;
            font-weight: bold;
            margin: 15px 0 30px;
        }
        .details {
            display: flex;
            justify-content: center;
            gap: 50px;
            margin: 30px 0;
            font-size: 14px;
            color: #475569;
        }
        .details span { font-weight: bold; color: #1e293b; }
        .score {
            text-align: center;
            margin: 20px 0;
        }
        .score .value {
            font-size: 48px;
            font-weight: bold;
            color: #16a34a;
        }
        .score .label {
            font-size: 14px;
            color: #64748b;
        }
        .footer {
            position: absolute;
            bottom: 30px;
            left: 50px; right: 50px;
            text-align: center;
            color: #94a3b8;
            font-size: 11px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }
        .watermark {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 120px;
            color: rgba(30, 64, 175, 0.04);
            font-weight: bold;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="border">
            <div class="watermark">RAHIMO</div>
            <h1>Certificat de Formation</h1>
            <div class="subtitle">Programme de Développement des Compétences</div>

            <div class="presented">Décerné à</div>
            <div class="employee">{{ $user->name }}</div>

            <div class="course-name">« {{ $course->titre }} »</div>

            <div class="details">
                <div>Score : <span>{{ $certificate->score }}%</span></div>
                <div>Délivré le : <span>{{ $certificate->issued_at->format('d/m/Y') }}</span></div>
                <div>Expire le : <span>{{ $certificate->expires_at->format('d/m/Y') }}</span></div>
            </div>

            <div class="score">
                <div class="value">{{ $certificate->score }}%</div>
                <div class="label">Score Final</div>
            </div>

            <div class="footer">
                Certificat n° {{ $certificate->certificate_number }} — Rahimo Transport SA<br>
                Ce certificat atteste que l'employé a suivi et réussi la formation avec succès.
            </div>
        </div>
    </div>
</body>
</html>
