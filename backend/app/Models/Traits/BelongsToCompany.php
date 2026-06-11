<?php

namespace App\Models\Traits;

use App\Models\Company;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToCompany
{
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForCurrentCompany($query, ?int $companyId = null)
    {
        $companyId ??= Auth::user()?->company_id;
        if ($companyId) {
            return $query->where($this->getTable() . '.company_id', $companyId);
        }
        return $query;
    }
}
