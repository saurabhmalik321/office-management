<?php

namespace App\Console\Commands;
use App\Models\Salary;
use Illuminate\Console\Command;

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
        $salaries = Salary::where('status','paid')->get();
        foreach ($salaries as $salary) {
            $salary->status = 'pending';
            $salary->save();
        }
     \Log::info('Updated individual salaries to pending.');
    }
}
