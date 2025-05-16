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
        return Salary::all();
    }

    public function markAsPaid(Salary $salary): Salary
    {
        $salary->status = 'paid';
        $salary->paid_at = now();
        $salary->save();
        return $salary;
    }
}
