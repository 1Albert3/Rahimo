<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number', 'type', 'client_id', 'client_name', 'client_phone', 'client_address',
        'issue_date', 'due_date', 'subtotal', 'tax_rate', 'tax_amount', 'total',
        'status', 'paid_at', 'notes',
    ];
}