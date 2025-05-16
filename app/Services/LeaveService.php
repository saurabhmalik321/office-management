<?php
namespace App\Services;

use App\Models\Leave;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
class LeaveService
{
    public function applyLeave(array $data): Leave
    {
        return Leave::create([
            'user_id' => Auth::id(),
            'leave_type' => $data['leave_type'],
            'reason' => $data['reason'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],

        ]);
    }

    public function getUserLeaves()
    {
        return Leave::with('user:id,name')->get();
    }

    public function updateStatus($data, $id)
    {
        $leave = Leave::where('id',$id)->where('user_id',$data['statusForm']['user_id'])->first();
        if($leave){
            $leave->status = $data['statusForm']['status'];
            $leave->save();
        }
        $notification = Notification::create([
            'hr_id' => auth()->id(),
            'employee_id' => $data['statusForm']['user_id'],
            'title' => $data['statusForm']['title'],
            'message' => $data['statusForm']['message'],
        ]);
        return $leave;
    }
}
