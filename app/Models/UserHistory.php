<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserHistory extends Model
{
    protected $fillable=[
        'user_id',
        'user_role',
        'description',
        'updated_by',
    ];
}
