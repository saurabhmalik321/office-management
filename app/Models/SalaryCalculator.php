<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class SalaryCalculator extends Model
{
     protected $fillable = [
        'user_id',
        'net_salary',
        'bonus',
        'tax_percent',
        'pf_percent',
        'leave_deduction',
    ];

    protected $casts = [
        'net_salary' => 'float',
        'bonus' => 'float',
        'tax_percent' => 'float',
        'pf_percent' => 'float',
        'leave_deduction' => 'integer',
    ];
    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }
}
