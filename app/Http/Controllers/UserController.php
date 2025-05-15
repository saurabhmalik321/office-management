<?php
// app/Http/Controllers/UserController.php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Interface\UserInterface;
use App\models\User;
use Inertia\Inertia;
class UserController extends Controller
{
    protected $userInterface;

    public function __construct(UserInterface $userInterface)
    {
        $this->userInterface = $userInterface;
    }

    public function index()
    {
        return response()->json($this->userInterface->all());
    }

    public function store(Request $request)
    {
        return response()->json($this->userInterface->create($request->all()));
    }

    public function show($id)
    {
        return response()->json($this->userInterface->find($id));
    }

    // public function update(Request $request, $id)
    // {
    //     return response()->json($this->userInterface->update($id, $request->all()));
    // }
    public function edit($id)
    {
        $user = User::findOrFail($id);
        return Inertia::render('Users/Edit', ['user' => $user]);
    }

   public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'user_role' => 'required|string',
        ]);
        $user = User::findOrFail($id);
        $user->update($request->only('name', 'email', 'user_role'));
        return Inertia::location(route('dashboard')); 
    }

    public function destroy($id)
    {
        return response()->json($this->userInterface->delete($id));
    }

}

