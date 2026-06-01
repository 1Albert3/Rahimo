<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    protected $fillable = [
        'reference', 'entry_date', 'account_code', 'account_label',
        'debit', 'credit', 'description', 'journal_type',
        'transactionable_id', 'transactionable_type',
    ];

    public function transactionable()
    {
        return $this->morphTo();
    }
}