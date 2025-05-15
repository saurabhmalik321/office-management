<?php

namespace App\Http\Controllers;

use App\Interface\UserInterface;
use App\Models\User;
use App\Models\Salary;
use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\SalaryService;
use App\Services\LeaveService;

class UserController extends Controller
{
    protected $userInterface;
    protected $salaryService;
    protected $leaveService;

    public function __construct(UserInterface $userInterface, SalaryService $salaryService, LeaveService $leaveService)
    {
        $this->userInterface = $userInterface;
        $this->salaryService = $salaryService;
        $this->leaveService = $leaveService;
    }

    // user
    public function index()
    {
        $this->authorize('viewAny', User::class);
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

    // salary
    public function indexSalaries()
    {
        $salaries = $this->salaryService->getUserSalaries(Auth::user());
        return response()->json($salaries);
    }

    public function storeSalary(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
        ]);

        $salary = $this->salaryService->create($data);
        return response()->json($salary, 201);
    }

    public function markSalaryAsPaid(Salary $salary)
    {
        return response()->json($this->salaryService->markAsPaid($salary));
    }

    // leave
    public function indexLeaves()
    {
        $leaves = $this->leaveService->getUserLeaves(Auth::user());
        return response()->json($leaves);
    }

    public function storeLeave(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|string',
            'reason' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $data['user_id'] = Auth::id();
        $leave = $this->leaveService->applyLeave($data);

        return response()->json($leave, 201);
    }

    public function updateLeaveStatus(Request $request, Leave $leave)
    {
        $status = $request->validate(['status' => 'required|in:pending,approved,rejected']);
        return response()->json($this->leaveService->updateStatus($leave, $status['status']));
    }
    public function dashboard()
    {
        $userRole = Auth::user()->user_role;

        return Inertia::render('Dashboard', [
            'authUserRole' => $userRole,
        ]);
    }
}
