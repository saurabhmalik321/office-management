<?php

namespace App\Observers;

use App\Models\User;
use App\Models\UserHistory;
use Illuminate\Support\Facades\Auth;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        UserHistory::create([
         'user_id' => $user->id ?? null,
         'user_role' => $user->user_role,
         'description' => "created user: ". json_encode($user->attributesToArray()),
         'updated_by' => Auth::id() ?? null,
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //  UserHistory::create([
        //  'user_id' => $user->id ?? null,
        //  'user_role' => $user->user_role,
        //  'description' => "Updated user: ". json_encode($user->attributesToArray()),
        //  'updated_by' => Auth::id() ?? null,
        // ]);
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
