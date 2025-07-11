<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Database\Seeders\SettingsTableSeeder; 

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Optional: generate dummy users
        // User::factory(10)->create();

        // Create one test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'user_role' => 'admin'
        ]);

        // Call the settings seeder
        $this->call(SettingsTableSeeder::class);
    }
}
