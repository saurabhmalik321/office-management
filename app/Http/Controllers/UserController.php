<?php

namespace App\Http\Controllers;

use App\Interface\UserInterface;
use App\Models\User;
use App\Models\Salary;
use App\Models\Leave;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\SalaryService;
use App\Services\LeaveService;
use App\Services\PolicyService;
use App\Models\Notification;
use App\Models\Message;
use App\Models\Settings;
use App\Models\UserHistory;
use App\Models\Performance;
use App\Models\SalaryCalculator;
use App\Models\HrPolicy;
use App\Models\{ContactUs, Quote};
use Illuminate\Support\Facades\Http;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    protected $userInterface;
    protected $salaryService;
    protected $leaveService;
    protected $policyService;

    public function __construct(UserInterface $userInterface, SalaryService $salaryService, LeaveService $leaveService,PolicyService $policyService)
    {
        $this->userInterface = $userInterface;
        $this->salaryService = $salaryService;
        $this->leaveService = $leaveService;
        $this->policyService = $policyService;
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
        $data = $this->userInterface->create($request->all());
        $this->calculatePreview($data->toArray());
        return response()->json($data);
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
        $user = User::where('id',$id)->first();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->user_role = $request->user_role;
        $user->salary = $request->salary;
        $salary = Salary::where('user_id',$id)->first();
        $salary->amount = $request->salary;
        $salary->save();
        $user->save();
        $data=[
            'user_id' => $id,
            'date' => $salary->date,
            'amount' => $request->salary
            ];
        $this->calculatePreview($data);
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
     public function getSingleUserLeave()
    {
        $leaves = $this->leaveService->getSingleUserLeave();
        return response()->json($leaves);
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


    public function deleteNotification($id)
    {
    $notification = Notification::find($id);

    if (!$notification) {
        return response()->json(['message' => 'Notification not found.'], 404);
    }

    // if ($notification->hr_id !== auth()->id()) {
    //     return response()->json(['message' => 'Unauthorized.'], 403);
    // }

    $notification->delete();

    return response()->json(['message' => 'Notification deleted successfully.']);
    }


    public function deleteInquiry($id)
    {
    $inquiry = Inquiry::find($id);

    if (!$inquiry) {
        return response()->json(['message' => 'Inquiry not found.'], 404);
    }

    // if ($notification->hr_id !== auth()->id()) {
    //     return response()->json(['message' => 'Unauthorized.'], 403);
    // }

    $inquiry->delete();

    return response()->json(['message' => 'Inquiry deleted successfully.']);
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
    public function getPerformance()
    {
        $user = Auth::user();

        $performances = $performances = Performance::with('user')
                            ->whereYear('evaluated_at', Carbon::now()->year)
                            ->whereMonth('evaluated_at', Carbon::now()->month)
                            ->latest()
                            ->get();
        return Inertia::render('Performance', [
            'performances' => $performances,
        ]);
    }
    public function getPerformances()
    {
        return $performances = Performance::with('user')->latest()->get();
    }

    public function storePerformance(Request $request): RedirectResponse
    {
        $date = Carbon::parse($request->evaluated_at);
        $curr_month = $date->month;
        $curr_year = $date->year;
        $performance = Performance::where('user_id', $request->user_id)
                    ->whereYear('evaluated_at', $curr_year)
                    ->whereMonth('evaluated_at', $curr_month)
                    ->first();
        if (!$performance) {
            $performance = new Performance();
            $performance->user_id = $request->user_id;
            $performance->evaluated_at = $request->evaluated_at;
        }

        $performance->category = implode(',', $request->category);
        $performance->score = $request->score;
        $performance->remarks = $request->remarks;
        $performance->save();

        return redirect()->back()->with('success', 'Performance added successfully.');
    }
    /// hr policies
    public function getPolicies()
    {
        $policies = $this->policyService->getPolicies();
        return Inertia::render('Policies/Index', ['policies' => $policies]);
    }

    public function storePolicies(Request $request)
    {
        $policies = $this->policyService->storePolicies($request->all());
        return redirect()->route('policies.index')->with('success', 'Policy uploaded successfully.');
    }

    public function download(HrPolicy $policy)
    {
        return Storage::disk('public')->download($policy->file_path);
    }
    public function viewDoc($id)
    {
        $policy = $this->policyService->viewDoc($id);
        return response()->file(storage_path('app/public/' . $policy->file_path));
    }

    public function deletePolicy($id)
{
    $this->policyService->deletePolicy($id);

    return redirect()->route('policies.index')->with('success', 'Policy deleted successfully.');
}


    public function postContact(Request $request){
        $contact = new ContactUS();
        $contact -> name = $request -> name;
        $contact -> phone = $request -> phone;
        $contact -> email = $request -> email;
        $contact -> subject = $request -> subject;
        $contact -> message = $request -> message;
        $contact -> save();
        return response()->json(['message' => 'submit successfully', 'success' => true]);
    }
    public function getContacts(){
        $contact = ContactUS::all();
        return response()->json([
            'message' => 'Contact list fetched successfully',
            'success' => true,
            'data' => $contact
        ]);
    }
    public function getQoute(Request $request){
        $quote = new Quote();
        $quote -> name = $request -> name;
        $quote -> phone = $request -> phone;
        $quote -> email = $request -> email;
        $quote -> microsoft_team_id = $request -> teams_id;
        $quote -> source = $request -> hear_about_us;
         $quote -> message = $request -> message;
        $quote -> save();
        return response()->json(['message' => 'submit successfully', 'success' => true]);
    }

    // auth employee performance
    public function getUserPerformace(){
        $performance = Performance::with('user')->where('user_id',Auth::id())->get();
        return $performance;
    }

    // messaging/chat
    public function getMessages($userId)
    {
       $receiver = User::findOrFail($userId);
        return Inertia::render('ChatBox', [
            'receiverId' => $receiver->id,
            'receiverName' => $receiver->name,
        ]);
    }

    public function storeMessages(Request $request)
    {
        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);
        return response()->json($message->load(['sender', 'receiver']));
    }
    // getAllMessages
    public function getAllMessages(Request $request)
    {
        $messages = Message::with(['sender', 'receiver'])->get();
        return response()->json($messages);
    }
    public function messagesBox()
    {
        return Inertia::render('ChatBox');
    }

    public function filter(Request $request)
    {
        if(Auth::user()->user_role == 'admin' || Auth::user()->user_role == 'hr'){
            $query = Salary::join('users', 'salaries.user_id', '=', 'users.id')
                ->select('salaries.*', 'users.name as name');
            if ($request->has('month') && $request->has('year')) {
                $query->whereMonth('salaries.date', $request->month)
                    ->whereYear('salaries.date', $request->year);
            }
            $salaries = $query->get();
        }else{
             $query = Salary::join('users', 'salaries.user_id', '=', 'users.id')
                ->select('salaries.*', 'users.name as name')->where('salaries.user_id', Auth::id());
            if ($request->has('month') && $request->has('year')) {
                $query->whereMonth('salaries.date', $request->month)
                    ->whereYear('salaries.date', $request->year);
            }
            $salaries = $query->get();
        }

        return response()->json($salaries);
    }


    public function updateNewSalaries(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'date' => 'required|date',
        ]);

        $user = User::where('id',$request->user_id)->first();
        $user -> salary = $request->amount;
        $user -> save();
        $salary = Salary::where('user_id',$request->user_id)->first();
        $salary -> amount = $request->amount;
        $salary->date = $request->date;
        $salary->save();
        $this->calculatePreview($request->all());
        return $salary;
    }

     // Salary Calculator
    public function calculatePreview(array $request)
    {
            $userId = $request['user_id'] ?? $request['id'] ?? null;
            $salary = $request['salary'] ?? $request['amount'] ?? null;
            $date = $request['joining_date'] ?? $request['date'] ?? null;
            if (!$userId) {
                return response()->json(['error' => 'User ID is required.'], 422);
            }

            $data = [
                'user_id' => $userId,
                'amount' => $salary,
                'pf_percent' => 1000,
                'bonus' => isset($request['bonus']) ? (float) $request['bonus'] : 0,
                'unpaid_leave_days' => isset($request['unpaid_leave_days']) ? (int) $request['unpaid_leave_days'] : 0,
                'date' => $date,
            ];
            $WORKING_DAYS = 22;
            $per_day = $data['amount'] / $WORKING_DAYS;
            $pf =$data['pf_percent'];
            $leave_deduction = $per_day * $data['unpaid_leave_days'];
            $net_salary = $data['amount'] + $data['bonus'] - $pf - $leave_deduction;
            $salary_cal = new SalaryCalculator();
            $salary_cal->user_id = $data['user_id'];
            $salary_cal->net_salary = $net_salary;
            $salary_cal->bonus = $data['bonus'];
            $salary_cal->providant_fund = $data['pf_percent'];
            $salary_cal->leave_deduction = $leave_deduction;
            $salary_cal->date = $data['date'];
            $salary_cal->save();
            return response()->json([
                'salary_preview' => $salary_cal
            ]);
    }



    public function getPreviousMonthLeaveDaysForEmployee()
    {
        $user = Auth::user();
        if (!$user || $user->user_role !== 'employee') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $start = Carbon::now()->subMonth()->startOfMonth()->toDateString();
        $end = Carbon::now()->subMonth()->endOfMonth()->toDateString();

        $totalDays = DB::table('leaves')
            ->where('status', 'approved')
            ->where('user_id', Auth::id())
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start, $end])
                    ->orWhereBetween('end_date', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_date', '<', $start)
                        ->where('end_date', '>', $end);
                    });
            })
            ->select(DB::raw("SUM(DATEDIFF(LEAST(end_date, '$end'), GREATEST(start_date, '$start')) + 1) as total"))
            ->value('total');

        return response()->json((int) $totalDays);
    }
    public function resetPassword(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'new_password' => 'required|min:6',
            'confirm_password' => 'required|same:new_password',
        ]);

        $user = User::findOrFail($request->user_id);
        $user->password = Hash::make($request->new_password);
        $user->save();

        return back()->with('success', 'Password updated successfully.');
    }

    public function viewSalary(Request $request)
    {
       $salary_data = SalaryCalculator::with('user')
                                    ->where('user_id', $request->id)
                                    ->where('date', $request->date)
                                    ->get();
        return $salary_data;
    }
    public function getBonus($id)
    {
       $bonus = SalaryCalculator::where('user_id', $id)->first();
       return $bonus->bonus;
    }

     public function getDate()
    {
       $date = Settings::all();
       return $date;
    }
     public function putDate(Request $request)
    {
       $date = new Settings();
       $date->date=$request->date;
       $date->save();
       return $date;
    }

}


