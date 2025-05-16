<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;
   protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'leave_type',
        'reason',
        'status',
    ];
    protected $casts = [
    'start_date' => 'date',
    'end_date' => 'date',
  ];
    // Relation to User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
