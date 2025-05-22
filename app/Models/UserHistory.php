<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class UserHistory extends Model
{
    protected $fillable=[
        'user_id',
        'user_role',
        'description',
        'updated_by',
    ];
    public function user()
    {
        return $this->belongsTo(User::class,'updated_by');
    }
}
