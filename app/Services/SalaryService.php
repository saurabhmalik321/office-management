<?php

namespace App\Services;

use App\Models\Salary;
use App\Models\Notification;
use App\Models\User;
use App\Models\SalaryCalculator;
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
        $data=[
           'user_id' => $salary->user_id,
           'date' => $salary->date,
           'amount' => $salary->amount
        ];
        $this->calculatePreview($data); 
        return $salary;
    }

    public function markAsPaid(array $data,$id)
    {
        $salary = Salary::where('id',$id)->first(); 
        $salary->status = 'paid';
        $salary->date = $data['date'];
        $salary->save();
        $notify = new Notification();
        $notify->hr_id = Auth::id();
        $notify->employee_id = $salary->user_id;
        $notify->title = $data['title'];
        $notify->message = $data['message'];
        $notify->save();
        return $salary;
    } 
    public function calculatePreview(array $request)
    {
        $userId = $request['user_id'] ?? $request['id'] ?? null;
        $salary = $request['salary'] ?? $request['amount'] ?? null;
        $date = $request['joining_date'] ?? $request['date'] ?? null;
        if (!$userId) {
            return response()->json(['error' => 'User ID is required.'], 422);
        }
        
        $data = [
            'user_id' => $userId,
            'amount' => $salary,
            'pf_percent' => 2,
            'bonus' => isset($request['bonus']) ? (float) $request['bonus'] : 0,
            'unpaid_leave_days' => isset($request['unpaid_leave_days']) ? (int) $request['unpaid_leave_days'] : 0,
            'date' => $date,
        ];
        $WORKING_DAYS = 22;
        $per_day = $data['amount'] / $WORKING_DAYS;
        $pf = $data['amount'] * ($data['pf_percent'] / 100);
        $leave_deduction = $per_day * $data['unpaid_leave_days'];
        $net_salary = $data['amount'] + $data['bonus'] - $pf - $leave_deduction;
        $salary_cal = new SalaryCalculator();
        $salary_cal->user_id = $data['user_id'];
        $salary_cal->net_salary = $net_salary;
        $salary_cal->bonus = $data['bonus'];
        $salary_cal->pf_percent = $data['pf_percent'];
        $salary_cal->leave_deduction = $leave_deduction;
        $salary_cal->date = $data['date'];
        $salary_cal->save();
        return response()->json([
            'salary_preview' => $salary_cal
        ]);
    }
}
