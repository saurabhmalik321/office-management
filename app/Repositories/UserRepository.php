<?php
namespace App\Repositories;
use App\Models\User;
use App\Models\Notification;
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
         $user = new User();
         $user->name = $data['name'];
         $user->email = $data['email'];
         $user->user_role = $data['user_role'];
         $user->password = $data['password'];
         $user->salary = $data['salary'];
         $user->save();
        return $user;
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
     public function sendNotification(array $data)
    {
        $notification = Notification::create([
            'hr_id' => auth()->id(),
            'employee_id' => $data['employee_id'],
            'title' => $data['title'],
            'message' => $data['message'],
        ]);
        return  $notification;
    }
    public function allEmployee()
    {
        return User::where('user_role', 'employee')->get();
    }
     public function getNotification($id){
        return $notifications = Notification::with(['hr:id,name,user_role'])
            ->where('employee_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
     }
    public function getUser($id)
    {
        $user = User::with(['leaves', 'salary'])->find($id)->toArray();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }
}
