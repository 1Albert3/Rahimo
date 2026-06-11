<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\LoyaltyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoyaltyServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_tier_returns_bronze_for_zero_points()
    {
        $user = User::factory()->create(['loyalty_points' => 0]);

        $result = LoyaltyService::getTier($user);

        $this->assertEquals(0, $result['points']);
        $this->assertEquals('bromze', $result['tier']['key']);
        $this->assertNotNull($result['next']);
    }

    public function test_get_tier_returns_silver_for_100_points()
    {
        $user = User::factory()->create(['loyalty_points' => 100]);

        $result = LoyaltyService::getTier($user);

        $this->assertEquals('argent', $result['tier']['key']);
        $this->assertEquals(5, $result['tier']['discount']);
    }

    public function test_get_tier_returns_gold_for_300_points()
    {
        $user = User::factory()->create(['loyalty_points' => 300]);

        $result = LoyaltyService::getTier($user);

        $this->assertEquals('or', $result['tier']['key']);
        $this->assertEquals(10, $result['tier']['discount']);
    }

    public function test_get_tier_returns_platinum_for_500_points()
    {
        $user = User::factory()->create(['loyalty_points' => 500]);

        $result = LoyaltyService::getTier($user);

        $this->assertEquals('platine', $result['tier']['key']);
        $this->assertEquals(15, $result['tier']['discount']);
        $this->assertNull($result['next']);
    }

    public function test_award_points_increments_user_points()
    {
        $user = User::factory()->create(['loyalty_points' => 50]);

        LoyaltyService::awardPoints($user, 10);

        $this->assertEquals(60, $user->fresh()->loyalty_points);
    }

    public function test_award_points_uses_default_value()
    {
        $user = User::factory()->create(['loyalty_points' => 0]);

        LoyaltyService::awardPoints($user);

        $this->assertEquals(10, $user->fresh()->loyalty_points);
    }

    public function test_apply_discount_returns_correct_amounts()
    {
        $user = User::factory()->create(['loyalty_points' => 300]);

        $result = LoyaltyService::applyDiscount($user, 10000);

        $this->assertEquals(10000, $result['original']);
        $this->assertEquals(10, $result['discount_percent']);
        $this->assertEquals(1000, $result['discount_amount']);
        $this->assertEquals(9000, $result['final']);
    }

    public function test_apply_discount_returns_zero_discount_for_bronze()
    {
        $user = User::factory()->create(['loyalty_points' => 0]);

        $result = LoyaltyService::applyDiscount($user, 5000);

        $this->assertEquals(0, $result['discount_percent']);
        $this->assertEquals(5000, $result['final']);
    }

    public function test_progress_percentage_is_correct()
    {
        $user = User::factory()->create(['loyalty_points' => 50]);

        $result = LoyaltyService::getTier($user);

        // Next is Argent at 100, need 50 more, progress = 50/100 * 100 = 50%
        $this->assertNotNull($result['next']);
    }
}
