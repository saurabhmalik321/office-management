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
        Schema::table('salary_calculators', function (Blueprint $table) {
            $table->renameColumn('pf_percent', 'providant_fund'); 
        });

        Schema::table('salary_calculators', function (Blueprint $table) {
            $table->double('providant_fund', 8, 2)->change(); 
        });
    }

    public function down(): void
    {
        Schema::table('salary_calculators', function (Blueprint $table) {
            $table->renameColumn('providant_fund', 'pf_percent');
        });

        Schema::table('salary_calculators', function (Blueprint $table) {
            $table->decimal('pf_percent', 8, 2)->change();
        });
    }
};
