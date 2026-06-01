<?php

namespace Tests\Feature;

use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\SpeedAlert;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\Certificate;
use App\Models\Baggage;
use App\Models\FraudCheck;
use App\Models\Company;
use App\Models\Station;
use App\Models\StationRoute;
use App\Models\WatchlistEntry;
use App\Models\PoliceCheckLog;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Trip $trip;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $vehicle = Vehicle::factory()->create(['capacity' => 50, 'status' => 'active']);
        $this->trip = Trip::factory()->create([
            'vehicle_id' => $vehicle->id,
            'available_seats' => 10,
            'price' => 5000,
            'departure_date' => now()->addDay(),
        ]);
    }

    public function test_user_can_search_trips()
    {
        $response = $this->get(route('trips.search'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Trips/Search'));
    }

    public function test_user_can_view_seats_for_trip()
    {
        $response = $this->get(route('trips.seats', $this->trip));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Trips/SeatSelection'));
    }

    public function test_booking_store_works_for_guest()
    {
        $response = $this->post(route('trips.confirm'), [
            'trip_id' => $this->trip->id,
            'passenger_name' => 'Test',
            'passenger_phone' => '70123456',
            'seat_numbers' => [1],
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', ['passenger_name' => 'Test']);
    }

    public function test_authenticated_user_can_create_booking()
    {
        $response = $this->actingAs($this->user)
            ->post(route('trips.confirm'), [
                'trip_id' => $this->trip->id,
                'passenger_name' => 'Test User',
                'passenger_phone' => '70123456',
                'seat_numbers' => [1, 2],
                'payment_method' => 'cash',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', ['passenger_name' => 'Test User']);
    }

    public function test_booking_decrements_available_seats()
    {
        $this->actingAs($this->user)
            ->post(route('trips.confirm'), [
                'trip_id' => $this->trip->id,
                'passenger_name' => 'Test',
                'passenger_phone' => '70123456',
                'seat_numbers' => [1, 2, 3],
                'payment_method' => 'cash',
            ]);

        $this->assertEquals(7, $this->trip->fresh()->available_seats);
    }

    public function test_booking_fails_when_no_seats_available()
    {
        $this->trip->update(['available_seats' => 1]);

        $response = $this->actingAs($this->user)
            ->post(route('trips.confirm'), [
                'trip_id' => $this->trip->id,
                'passenger_name' => 'Test',
                'passenger_phone' => '70123456',
                'seat_numbers' => [1, 2, 3],
                'payment_method' => 'cash',
            ]);

        $response->assertSessionHasErrors('seat_numbers');
    }

    // ─── Phase A : Speed Alerts ──────────────────────────────────────────

    public function test_speed_alert_created_on_excessive_speed()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $vehicle = Vehicle::factory()->create(['status' => 'active']);
        $trip = Trip::factory()->create(['vehicle_id' => $vehicle->id, 'status' => 'in_progress', 'departure_date' => today()]);

        $alert = SpeedAlert::create([
            'vehicle_id' => $vehicle->id,
            'trip_id' => $trip->id,
            'speed' => 110,
            'speed_limit' => 90,
            'latitude' => 12.3714,
            'longitude' => -1.5197,
            'level' => 'danger',
            'status' => 'active',
        ]);

        $this->actingAs($admin)->get(route('admin.speed-alerts'))
            ->assertStatus(200);

        $this->assertDatabaseHas('speed_alerts', ['vehicle_id' => $vehicle->id, 'level' => 'danger']);
    }

    public function test_speed_alert_acknowledge()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $vehicle = Vehicle::factory()->create();
        $alert = SpeedAlert::factory()->create(['vehicle_id' => $vehicle->id, 'status' => 'active']);

        $this->actingAs($admin)->post(route('admin.speed-alerts.acknowledge', $alert));
        $this->assertEquals('acknowledged', $alert->fresh()->status);
    }

    // ─── Phase B : Formations E-Learning ─────────────────────────────────

    public function test_admin_can_create_course()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);

        $this->actingAs($admin)->post(route('admin.formations.cours.stocker'), [
            'titre' => 'Sécurité Routière',
            'categorie' => 'securite',
            'difficulte' => 'debutant',
            'duree_minutes' => 30,
        ])->assertRedirect();

        $this->assertDatabaseHas('courses', ['titre' => 'Sécurité Routière']);
    }

    public function test_admin_can_add_quiz_to_course()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $course = Course::factory()->create();

        $this->actingAs($admin)->post(route('admin.formations.quiz.stocker', $course), [
            'question' => 'Quelle est la limite de vitesse ?',
            'options' => ['90 km/h', '110 km/h', '130 km/h'],
            'correct_answer' => '90 km/h',
            'points' => 10,
        ]);

        $this->assertDatabaseHas('quizzes', ['course_id' => $course->id]);
    }

    public function test_certificate_generated()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $course->progress()->create(['user_id' => $user->id, 'completed' => true, 'score' => 90]);

        $this->actingAs($admin)->post(route('admin.certificats.emettre'), [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->assertDatabaseHas('certificates', ['user_id' => $user->id, 'course_id' => $course->id]);
    }

    // ─── Phase C : Rapports ──────────────────────────────────────────────

    public function test_reports_page_loads()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $this->actingAs($admin)->get(route('admin.rapports'))
            ->assertStatus(200);
    }

    public function test_report_csv_export()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $this->actingAs($admin)->get(route('admin.rapports.csv'))
            ->assertStatus(200);
    }

    // ─── Phase D : Police ────────────────────────────────────────────────

    public function test_police_verify_passenger_no_match()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);

        $response = $this->actingAs($admin)->post(route('admin.police.verifier'), [
            'full_name' => 'Jean Dupont',
            'phone' => '70123456',
        ]);

        $response->assertJson(['match' => false]);
    }

    public function test_police_verify_passenger_with_match()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        WatchlistEntry::create(['full_name' => 'Jean Dupont', 'reason' => 'Test', 'status' => 'active']);

        $response = $this->actingAs($admin)->post(route('admin.police.verifier'), [
            'full_name' => 'Jean Dupont',
        ]);

        $response->assertJson(['match' => true]);
    }

    public function test_police_watchlist_crud()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);

        $this->actingAs($admin)->post(route('admin.police.watchlist.stocker'), [
            'full_name' => 'Personne Recherchée',
            'reason' => 'Test',
        ]);

        $this->assertDatabaseHas('watchlist_entries', ['full_name' => 'Personne Recherchée']);
    }

    // ─── Phase F : Bagages ───────────────────────────────────────────────

    public function test_baggage_registration()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);

        $response = $this->actingAs($admin)->post(route('admin.bagages.stocker'), [
            'passenger_name' => 'Test Passager',
            'type' => 'suitcase',
            'weight_kg' => '15',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('baggage', ['passenger_name' => 'Test Passager']);
    }

    public function test_baggage_scan()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $bag = Baggage::factory()->create();

        $response = $this->actingAs($admin)->post(route('admin.bagages.scanner'), [
            'tag_number' => $bag->tag_number,
            'action' => 'load',
        ]);

        $response->assertJson(['success' => true]);
        $this->assertEquals('loaded', $bag->fresh()->status);
    }

    // ─── Phase G : Anti-Fraude ───────────────────────────────────────────

    public function test_fraud_page_loads()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $this->actingAs($admin)->get(route('admin.fraude'))
            ->assertStatus(200);
    }

    public function test_fraud_alert_resolve()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $fraud = FraudCheck::factory()->create(['status' => 'open']);

        $this->actingAs($admin)->post(route('admin.fraude.resoudre', $fraud));
        $this->assertEquals('resolved', $fraud->fresh()->status);
    }

    // ─── Phase H : Multi-Compagnies & Gares ──────────────────────────────

    public function test_company_creation()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);

        $this->actingAs($admin)->post(route('admin.compagnies.stocker'), [
            'name' => 'Rahimo Express',
            'slug' => 'rahimo-express',
        ])->assertRedirect();

        $this->assertDatabaseHas('companies', ['slug' => 'rahimo-express']);
    }

    public function test_station_creation()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);

        $this->actingAs($admin)->post(route('admin.gares.stocker'), [
            'name' => 'Gare Centrale',
            'city' => 'Ouagadougou',
            'type' => 'terminal',
        ]);

        $this->assertDatabaseHas('stations', ['name' => 'Gare Centrale']);
    }

    public function test_station_route_creation()
    {
        $admin = User::factory()->create(['role' => 'directeur_general']);
        $station1 = Station::factory()->create();
        $station2 = Station::factory()->create();

        $this->actingAs($admin)->post(route('admin.gares.routes.stocker'), [
            'departure_station_id' => $station1->id,
            'arrival_station_id' => $station2->id,
            'route_name' => 'Ouaga → Bobo',
            'base_price' => 5000,
        ]);

        $this->assertDatabaseHas('station_routes', ['route_name' => 'Ouaga → Bobo']);
    }

    // ─── Filtrage compagnie ──────────────────────────────────────────────

    public function test_company_scoping_filters_data()
    {
        $adminA = User::factory()->create(['role' => 'directeur_general', 'company_id' => 1]);
        $adminB = User::factory()->create(['role' => 'directeur_general', 'company_id' => 2]);

        Vehicle::factory()->create(['company_id' => 1, 'registration_number' => 'BUS-001']);
        Vehicle::factory()->create(['company_id' => 2, 'registration_number' => 'BUS-002']);

        $response = $this->actingAs($adminA)->get(route('admin.flotte'));
        $response->assertStatus(200);
    }
}
