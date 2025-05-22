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
        $salaries = Salary::select('salaries.*', 'users.name')
        ->join('users', 'users.id', '=', 'salaries.user_id')
        ->where('users.user_role', 'employee')
        ->get();

    return $salaries;
    }
    public function getSingleUserSalaries()
    {
       $salaries = Salary::select('salaries.*', 'users.name')
            ->join('users', 'users.id', '=', 'salaries.user_id')
            ->where('salaries.user_id', Auth::id())
            ->get();
        return $salaries;
    }
    public function getSalaryStatus()
    {
         return Salary::where('user_id',Auth::id())->get();
    }
    public function updateSalary(object $data, $id)
    {
        $salary = Salary::where('id', $id)->first(); 
        $salary->status = $data->status;
        $salary->date = $data->date;
        $salary->amount = $data->amount;
        $salary->save();

        $user = User::where('id', $salary->user_id)->first(); 
        $user->name = $data->name;
        $user->salary = $data->amount;
        $user->save();

        $salary->user = $user->name; 

        return $salary;
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
