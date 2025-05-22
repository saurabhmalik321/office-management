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
use App\Models\Notification;
use App\Models\UserHistory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;


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
        $this->authorize('create', User::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'user_role' => 'required|string|in:admin,hr,employee',
        ]);

        return response()->json($this->userInterface->create($request->all()));
    }

    public function show($id)
    {
          $user = $this->userInterface->find($id);
          return Inertia::render('Users/UserDetails', ['user' => $user]);
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
        // return Inertia::location(route('manageusers'));
    }

    public function destroy($id)
    {
        return response()->json($this->userInterface->delete($id));
    }

    // salary
    public function indexSalaries()
    {
        $salaries = $this->salaryService->getUserSalaries();
        return response()->json($salaries);
    }
    public function getSingleUserSalaries()
    {
        $salaries = $this->salaryService->getSingleUserSalaries();
        return response()->json($salaries);
    }
    
    public function getSalaryStatus()
    {
          $salaries = $this->salaryService->getSalaryStatus();
        return response()->json($salaries);
    }

    public function storeSalary(Request $request)
    {
        $salary = $this->salaryService->create($data);
        return response()->json($salary, 200);
    }

    public function updateSalary(Request $request,$id)
    {
         $data = (object) $request->all();
         $salary = $this->salaryService->updateSalary($data, $id);
        return response()->json($salary, 200);
    }

    public function markSalaryAsPaid(Request $request,$id)
    {
        return response()->json($this->salaryService->markAsPaid($request->all(),$id));
    }

    // leave
    public function indexLeaves()
    {
        $leaves = $this->leaveService->getUserLeaves();
        return response()->json($leaves);
    }

    public function storeLeave(Request $request)
    {
        $leave = $this->leaveService->applyLeave($request->all());
        return response()->json($leave, 201);
    }

    public function updateLeaveStatus(Request $request, $id)
    {
        return response()->json($this->leaveService->updateStatus($request->all(), $id));
    }
    public function dashboard()
    {
          $user = Auth::user();

    $notifications = Notification::where('hr_id', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->get(['id', 'title', 'message', 'created_at']);

    return Inertia::render('Dashboard', [
        'authUserRole' => $user->user_role,
        'auth' => [
            'user' => $user,
        ],
        'notifications' => $notifications,
    ]);
    }
    public function pendingLeave()
    {
        $leaves = $this->leaveService->pendingLeave();
        return response()->json($leaves);
    }

    public function sendNotification(Request $request)
    {
        $this->authorize('notify', User::class);
        return response()->json($this->userInterface->sendNotification($request->all()));
    }

     public function onlyEmployee()
    {
          return response()->json($this->userInterface->allEmployee());
    }
     public function getNotification($id)
    {
          return response()->json($this->userInterface->getNotification($id));
    }
     public function getUser($id)
    {
          return response()->json($this->userInterface->getUser($id));
    }
    public function handleMessage(Request $request)
    {
        try {
            $reply = $this->userInterface->handleMessage($request->all());
            return $reply;
        } catch (\Exception $e) {
            Log::error('Chatbot Exception:', ['message' => $e->getMessage()]);
            return response()->json(['reply' => 'Something went wrong.']);
        }
    }
    public function getAdminHrUsers()
    {
       return response()->json($this->userInterface->getAdminHrUsers());
    }
    public function sendInquiry(Request $request)
    {
       return response()->json($this->userInterface->sendInquiry($request->all()));
    }
     public function getInquiry()
    {
       return response()->json($this->userInterface->getInquiry(Auth::id()));
    }
     public function getHistory()
    {
     $history = UserHistory::all();
     return $history;  
    }
}


