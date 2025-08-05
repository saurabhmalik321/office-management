<?php

namespace App\Console\Commands;
use App\Models\Salary;
use App\Models\User;
use App\Models\Settings;
use Illuminate\Console\Command;
use Carbon\Carbon;
class ThirtyDayTask extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:thirty-day-task';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
       $setting = Settings::latest()->first();
       if ($setting && $setting->date === Carbon::now()->toDateString()) {
            $users = User::whereIn('user_role', ['employee', 'hr'])->get();

            foreach ($users as $user) {
                $previousSalary = Salary::where('user_id', $user->id)
                    ->orderBy('date', 'desc')
                    ->first();

                $amount = $previousSalary ? $previousSalary->amount : 0;

                $salary = $previousSalary ?? new Salary();

                $salary->user_id = $user->id;
                $salary->amount = $amount;
                $salary->status = 'pending';
                $salary->date = Carbon::now()->toDateString();
                $salary->save();
            }
        }

     \Log::info('Updated individual salaries to pending.');
    }
}
