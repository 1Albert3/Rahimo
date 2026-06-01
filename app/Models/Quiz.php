<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'question',
        'options',
        'correct_answer',
        'points',
    ];

    protected $casts = [
        'options' => 'array',
        'points' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function isCorrect(string $answer): bool
    {
        return $this->correct_answer === $answer;
    }
}
