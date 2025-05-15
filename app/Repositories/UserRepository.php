<?php
namespace App\Repositories;
use App\Models\User;
use App\Interface\UserInterface;

class UserRepository implements UserInterface
{
    public function all()
    {
        return User::all();
    }
    public function find($id)
    {
        return User::findOrFail($id);
    }

    public function create(array $data)
    {
        return User::create($data);
    }

    public function update($id, array $data)
    {
        $user = $this->find($id);
        $user->update($data);
        return $user;
    }

    public function delete($id)
    {
        return $this->find($id)->delete();
    }
     public function userLeaves($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $leaves = $user->leaves;
        return response()->json($leaves);
    }
    public function userSalary($userId)
    {
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $salary = $user->salary;
        return response()->json($salary);
    }
}
