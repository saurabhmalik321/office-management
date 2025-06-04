<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('salary_calculators', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->decimal('net_salary', 10, 2)->default(0);
            $table->decimal('bonus', 10, 2)->nullable()->default(0);
            $table->decimal('pf_percent', 5, 2)->default(0);
            $table->string('leave_deduction')->nullable()->defaul(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_calculators');
    }
};
