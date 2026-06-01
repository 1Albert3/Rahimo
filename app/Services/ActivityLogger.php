<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogger
{
    public static function log(
        string $action,
        ?string $description = null,
        ?string $entityType = null,
        ?int $entityId = null,
    ): void {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'entity_type' => $entityType,
            'entity_id' => $entityId,
        ]);
    }
}
