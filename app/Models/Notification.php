<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class Notification extends Model
{
    protected $fillable = [
        'hr_id', 'employee_id', 'title', 'message',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function hr()
    {
        return $this->belongsTo(User::class, 'hr_id');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('employee_id', $userId)
                     ->orWhere('hr_id', $userId);
    }
}

