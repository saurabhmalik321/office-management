<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HrPolicy extends Model
{
    protected $fillable=[
        'title',
        'description',
        'file_path',
        'uploaded_by',
    ];
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
