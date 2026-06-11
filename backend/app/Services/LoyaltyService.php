<?php

namespace App\Services;

use App\Models\User;

class LoyaltyService
{
    const TIERS = [
        'bromze'  => ['points' => 0,   'label' => 'Bronze',  'discount' => 0],
        'argent'  => ['points' => 100, 'label' => 'Argent',  'discount' => 5],
        'or'      => ['points' => 300, 'label' => 'Or',      'discount' => 10],
        'platine' => ['points' => 500, 'label' => 'Platine', 'discount' => 15],
    ];

    const POINTS_PER_BOOKING = 10;

    public static function getTier(User $user): array
    {
        $points = $user->loyalty_points;

        $tier = self::TIERS['bromze'];
        foreach (self::TIERS as $key => $cfg) {
            if ($points >= $cfg['points']) {
                $tier = $cfg;
                $tier['key'] = $key;
            }
        }

        $next = null;
        foreach (self::TIERS as $key => $cfg) {
            if ($cfg['points'] > $points) {
                $next = ['key' => $key, 'label' => $cfg['label'], 'needed' => $cfg['points'] - $points];
                break;
            }
        }

        return [
            'points'   => $points,
            'tier'     => $tier,
            'next'     => $next,
            'progress' => $next ? ($points / $next['needed']) * 100 : 100,
        ];
    }

    public static function awardPoints(User $user, int $points = self::POINTS_PER_BOOKING): void
    {
        $user->increment('loyalty_points', $points);
    }

    public static function applyDiscount(User $user, float $amount): array
    {
        $tier = self::getTier($user);
        $discountPercent = $tier['tier']['discount'];
        $discountAmount = $amount * $discountPercent / 100;

        return [
            'original'        => $amount,
            'discount_percent'=> $discountPercent,
            'discount_amount' => $discountAmount,
            'final'           => $amount - $discountAmount,
            'tier'            => $tier['tier'],
        ];
    }
}
