<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // ─── RH : Contrats ─────────────────────────────────────────────
        Schema::create('contracts', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('type', ['cdi', 'cdd', 'stage', 'prestation', 'saisonnier'])->default('cdi');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('salary_base', 12)->default(0);
            $table->decimal('transport_allowance', 10)->default(0);
            $table->decimal('housing_allowance', 10)->default(0);
            $table->decimal('other_allowances', 10)->default(0);
            $table->text('duties')->nullable();
            $table->string('document_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── RH : Congés ───────────────────────────────────────────────
        Schema::create('leaves', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('type', ['annual', 'sick', 'special', 'unpaid', 'maternity'])->default('annual');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // ─── RH : Pointage ─────────────────────────────────────────────
        Schema::create('attendance', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->date('date');
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->enum('status', ['present', 'absent', 'late', 'half_day', 'leave', 'holiday'])->default('present');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'date']);
        });

        // ─── RH : Bulletins de paie ────────────────────────────────────
        Schema::create('pay_slips', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('period'); // ex: 2026-05
            $table->decimal('base_salary', 12)->default(0);
            $table->decimal('transport_allowance', 10)->default(0);
            $table->decimal('housing_allowance', 10)->default(0);
            $table->decimal('other_allowances', 10)->default(0);
            $table->decimal('bonus', 10)->default(0);
            $table->decimal('overtime', 10)->default(0);
            $table->decimal('deductions', 10)->default(0);
            $table->decimal('tax', 10)->default(0);
            $table->decimal('cnss', 10)->default(0);
            $table->decimal('net_salary', 12)->default(0);
            $table->string('status')->default('draft'); // draft, paid, cancelled
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── RH : Documents employés ───────────────────────────────────
        Schema::create('employee_documents', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('type'); // cv, diplome, contrat, cnps, permis, medical
            $table->string('label');
            $table->string('file_path');
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── Compta : Factures ──────────────────────────────────────────
        Schema::create('invoices', function ($table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->enum('type', ['sale', 'purchase', 'expense', 'credit_note'])->default('sale');
            $table->unsignedBigInteger('client_id')->nullable();
            $table->string('client_name')->nullable();
            $table->string('client_phone')->nullable();
            $table->string('client_address')->nullable();
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 12)->default(0);
            $table->decimal('tax_rate', 5)->default(0);
            $table->decimal('tax_amount', 10)->default(0);
            $table->decimal('total', 12)->default(0);
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── Compta : Grand-Livre ──────────────────────────────────────
        Schema::create('journal_entries', function ($table) {
            $table->id();
            $table->string('reference')->nullable();
            $table->date('entry_date');
            $table->string('account_code', 20);
            $table->string('account_label');
            $table->decimal('debit', 12)->default(0);
            $table->decimal('credit', 12)->default(0);
            $table->text('description')->nullable();
            $table->string('journal_type')->default('general'); // general, sales, purchases, cash, bank
            $table->morphs('transactionable');
            $table->timestamps();
        });

        // ─── Compta : Budgets ──────────────────────────────────────────
        Schema::create('budgets', function ($table) {
            $table->id();
            $table->string('label');
            $table->enum('period_type', ['monthly', 'quarterly', 'yearly'])->default('yearly');
            $table->string('period'); // ex: 2026, 2026-Q1, 2026-05
            $table->decimal('total_amount', 14)->default(0);
            $table->decimal('spent_amount', 14)->default(0);
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ─── Sécurité : Alertes ────────────────────────────────────────
        Schema::create('police_alerts', function ($table) {
            $table->id();
            $table->string('alert_type'); // wanted_person, stolen_vehicle, security_threat, accident
            $table->string('severity'); // low, medium, high, critical
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->string('person_name')->nullable();
            $table->string('person_phone')->nullable();
            $table->string('person_id_document')->nullable();
            $table->text('description');
            $table->enum('status', ['open', 'investigating', 'resolved', 'false_alarm'])->default('open');
            $table->unsignedBigInteger('handled_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        // ─── Sécurité : Rapports d'incidents ───────────────────────────
        Schema::create('incident_reports', function ($table) {
            $table->id();
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->unsignedBigInteger('driver_id')->nullable();
            $table->enum('type', ['accident', 'breakdown', 'assault', 'theft', 'harassment', 'other']);
            $table->date('incident_date');
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('description');
            $table->text('actions_taken')->nullable();
            $table->text('injuries')->nullable();
            $table->text('damages')->nullable();
            $table->string('police_report_number')->nullable();
            $table->json('photos')->nullable();
            $table->enum('status', ['reported', 'investigating', 'resolved', 'closed'])->default('reported');
            $table->unsignedBigInteger('reported_by');
            $table->timestamps();
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('leaves');
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('pay_slips');
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('police_alerts');
        Schema::dropIfExists('incident_reports');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};