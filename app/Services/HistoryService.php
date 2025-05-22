<?php
namespace App\Services;

use App\Models\Leave;
use App\Models\User;
use App\Models\UserHistory;
use Illuminate\Support\Facades\Auth;
class HistoryService
{
  public function userHistory(array $data)
    {
        return UserHistory::create([
            'user_id' => $data['user_id'],
            'description' => $data['description'],
            'user_role' => $data['user_role'],
            'updated_by' => Auth::id(),
        ]);
    }
}
