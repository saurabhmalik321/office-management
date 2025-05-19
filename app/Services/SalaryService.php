<?php

namespace App\Services;

use App\Models\Salary;
use App\Models\User;

class SalaryService
{
    public function create(array $data): Salary
    {
        return Salary::create($data);
    }

    public function getUserSalaries(User $user)
    {
        $salaries = Salary::select('salaries.*', 'users.name')
        ->join('users', 'users.id', '=', 'salaries.user_id')
        ->where('users.user_role', 'employee')
        ->get();

    return $salaries;
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
        $user->save();

        $salary->user = $user->name; 

        return $salary;
    }

    public function markAsPaid(Salary $salary): Salary
    {
        $salary->status = 'paid';
        $salary->paid_at = now();
        $salary->save();
        return $salary;
    }
}
