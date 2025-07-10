<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable=[
        'name',
        'phone',
        'email',
        'microsoft_team_id',
        'source',
        'message',
        'website',
    ];
}
