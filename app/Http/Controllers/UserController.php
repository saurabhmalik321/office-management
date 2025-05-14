<?php
// app/Http/Controllers/UserController.php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Interface\UserInterface;

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

    public function update(Request $request, $id)
    {
        return response()->json($this->userInterface->update($id, $request->all()));
    }

    public function destroy($id)
    {
        return response()->json($this->userInterface->delete($id));
    }

}

