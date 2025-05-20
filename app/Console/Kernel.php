<?php
use App\Console\Commands\ThirtyDayTask;
use Illuminate\Console\Scheduling\Schedule;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
         $schedule->command(MonthlyTask::class)
                 ->monthlyOn(11, '00:00');        
    }
}
