<?php
namespace App\Services;

use App\Models\Leave;
use App\Models\User;

class LeaveService
{
    public function applyLeave(array $data): Leave
    {
        return Leave::create($data);
    }

    public function getUserLeaves(User $user)
    {
        return Leave::where('user_id', $user->id)->get();
    }

    public function updateStatus(Leave $leave, string $status): Leave
    {
        $leave->status = $status;
        $leave->save();
        return $leave;
    }
}
