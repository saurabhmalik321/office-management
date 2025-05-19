<?php

namespace App\Services;

use App\Models\Salary;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SalaryService
{
    public function create(array $data): Salary
    {
        return Salary::create($data);
    }

    public function getUserSalaries()
    {
        $salaries = Salary::with('user:id,name')
                    ->whereHas('user', function ($query) {
                        $query->where('user_role', 'employee');
                    })
                    ->get();

        return $salaries;
    }

    public function markAsPaid(array $data,$id)
    {
        $salary = Salary::where('id',$id)->first(); 
        $salary->status = 'paid';
        $salary->date = now();
        $salary->save();
        $notify = new Notification();
        $notify->hr_id = Auth::id();
        $notify->employee_id = $salary->user_id;
        $notify->title = $data['title'];
        $notify->message = $data['message'];
        $notify->save();
        return $salary;
    } 
}
