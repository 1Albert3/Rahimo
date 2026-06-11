<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Barryvdh\DomPDF\Facade\Pdf;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'certificate_number',
        'score',
        'issued_at',
        'expires_at',
        'pdf_path',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'score' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public static function generateNumber(): string
    {
        return 'CERT-' . strtoupper(substr(md5(uniqid()), 0, 10));
    }

    public function generatePdf(): string
    {
        $dir = storage_path('app/public/certificats');
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $path = "certificats/{$this->certificate_number}.pdf";
        $full = storage_path("app/public/{$path}");

        $pdf = Pdf::loadView('pdf.certificate', [
            'user' => $this->user,
            'course' => $this->course,
            'certificate' => $this,
        ]);

        $pdf->save($full);

        $this->update(['pdf_path' => $path]);

        return $path;
    }
}
