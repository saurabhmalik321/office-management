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
        $userMessage = $request->input('message');

        try {
            $keywordResponses = [
                'hi' => 'Hello! I am ChatBot, your virtual HR assistant.',
                'ceo' => 'Our CEO is Mr. Nitin Goswami.',
                'address' => 'Our Company address is sector 74,mohali tower,mohali(punjab)',
                'company' => 'Our Company name is Wepro Solutions.',
                'name' => 'I am ChatBot, here to assist you with HR-related queries.',
                'salary' => 'Our entry-level salary typically starts at ₹20,000 per month, depending on the role.',
                'leave' => 'Employees are entitled to 21 paid leaves per year, including casual and sick leaves.',
                'holiday' => 'You can view the holiday list in the HR portal under "Holiday Calendar".',
                'bonus' => 'Performance-based bonuses are distributed annually based on appraisals.',
                'appraisal' => 'Appraisals are conducted once a year, usually in March.',
                'timing' => 'Our standard office hours are from 9:30 AM to 7:00 PM, Monday to Friday.',
                'remote' => 'Remote work is allowed with prior manager approval.',
                'late' => 'Please inform your manager if you are running late. Repeated late marks may affect appraisals.',
                'dress' => 'We follow a smart casual dress code from Monday to Thursday. Fridays are casual.',
                'id' => 'If you have lost your ID card, please contact the admin team for a replacement.',
                'probation' => 'The probation period for new employees is 3 months.',
                'notice' => 'The standard notice period is 30 days.',
                'internship' => 'Yes, we offer internships. Check with HR for current openings.',
                'experience' => 'Experience letters are provided post-resignation upon request.',
                'resign' => 'You can submit your resignation through the HR portal.',
                'location' => 'Our office is located at: 123 Corporate Park, Mumbai.',
                'manager' => 'If you face any issues, please reach out to your reporting manager or HR.',
                'policy' => 'Company policies are available in the HR portal under "Documents".',
            ];

            $userMessageNormalized = strtolower(trim($userMessage));
            $userWords = explode(' ', $userMessageNormalized);

            $botReply = 'Sorry, I didn’t understand that. Can you rephrase or ask something else?';

            foreach ($userWords as $word) {
                if (array_key_exists($word, $keywordResponses)) {
                    $botReply = $keywordResponses[$word];
                    break;
                }
            }

            return response()->json(['reply' => $botReply]);

        } catch (\Exception $e) {
            Log::error('Chatbot Exception:', ['message' => $e->getMessage()]);
            return response()->json(['reply' => 'Something went wrong.']);
        }
    }
}


