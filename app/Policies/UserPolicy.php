<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
     public function viewAny(User $user): bool
    {
        return in_array($user->user_role, ['admin', 'hr']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
         return in_array($user->user_role, ['admin', 'hr']);
    }
     public function notify(User $user): bool
    {
         return in_array($user->user_role, ['hr']);
    }

    /**
     * Determine whether the user can update the model.
     */
  public function update(User $authUser, User $user): bool
   {
        // Check based on user_role column
        if (in_array($authUser->user_role, ['admin', 'hr'])) {
            return true;
        }

        // Allow user to update their own profile
        return $authUser->id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }

    public function uploadPolicy(User $user)
    {
        return $user->hasRole('Admin') || $user->hasRole('HR');
    }

    public function downloadPolicy(User $user)
    {
        return true;
    }
}
