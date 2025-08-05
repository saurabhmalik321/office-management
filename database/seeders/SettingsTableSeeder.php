<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SettingsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('settings')->insert([
            [
                'date' => '2025-07-11',
                'day' => Carbon::parse('2025-07-11')->dayOfWeek,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
