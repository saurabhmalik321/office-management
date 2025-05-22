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
        $original = $user->getOriginal();
        $changes = [];

        foreach ($user->getAttributes() as $field => $value) {
            if ($field === 'updated_at') {
                continue;
            }

            if ($user->isDirty($field)) {
                $originalValue = $original[$field] ?? '';
                $newValue = $value;
                if (in_array($field, ['salary', 'amount', 'direct_salary'])) {
                    $originalValue = '₹' . number_format((float)$originalValue, 2, '.', ',');
                    $newValue = '₹' . number_format((float)$newValue, 2, '.', ',');
                }

                $changes[] = " {$field} from  {$originalValue} to {$newValue} ";
            }
        }

        if (!empty($changes)) {
            UserHistory::create([
                'user_id' => $user->id,
                'user_role' => $user->user_role,
                'description' =>'modified '. implode("; ", $changes),
                'updated_by' => Auth::id() ?? null,
            ]);
        }
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
