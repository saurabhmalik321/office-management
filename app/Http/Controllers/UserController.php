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

                // Greetings
                'hi' => 'Hi there! I’m ChatBot, your virtual HR assistant. How can I help you today?',
                'hello' => 'Hello! I’m ChatBot, your virtual HR assistant. Feel free to ask me about salary, leaves, holidays, and more.',
                'greetings' => 'Greetings! I’m here to help you with HR-related queries.',

                // Leadership
                'ceo' => 'Our CEO is Mr. Nitin Goswami.',
                'founder' => 'Our CEO is Mr. Nitin Goswami.',
                'leader' => 'Our CEO is Mr. Nitin Goswami.',

                // Company Info
                'company' => 'Our company name is Wepro Solutions.',
                'about company' => 'Wepro Solutions is a growing tech firm based in Mohali.',
                'address' => 'We are located at Sector 74, Mohali Tower, Mohali (Punjab).',
                'location' => 'We are located at Sector 74, Mohali Tower, Mohali (Punjab).',
                'office' => 'We are located at Sector 74, Mohali Tower, Mohali (Punjab).',
                'employee' => 'We are 10 members staff',

                // Identity
                'name' => 'I’m ChatBot, your HR assistant. Ask me anything about work, policies, or support.',

                // Salary
                'salary' => 'Salaries are credited on the 10th of every month.',
                'pay' => 'Entry-level salary starts from ₹20,000 per month, depending on the role.',
                'payment' => 'Salaries are credited monthly, usually on the 10th.',

                // Leave
                'leave' => 'Employees are entitled to 21 paid leaves per year (including casual and sick leaves).',
                'leaves' => 'You get 21 paid leaves annually, including casual and sick leave.',
                'leave balance' => 'You can check your leave balance in the HR portal.',

                // Holiday
                'holiday' => 'Check the "Holiday Calendar" in the HR portal to see upcoming holidays.',
                'holidays' => 'You can view all holidays in the HR portal under "Holiday Calendar".',

                // Bonus / Appraisal
                'bonus' => 'Performance bonuses are distributed annually based on your appraisal results.',
                'incentive' => 'Annual incentives are based on your performance reviews.',
                'reward' => 'Rewards are performance-linked and reviewed annually.',
                'appraisal' => 'Appraisals happen once a year, typically in March.',
                'performance' => 'Performance reviews are done yearly and influence appraisals.',
                'review' => 'Annual performance reviews occur in March.',
                'rating' => 'Performance ratings are assigned during yearly appraisals in March.',

                // Timing / Attendance
                'timing' => 'Office hours are 9:30 AM to 7:00 PM, Monday to Friday.',
                'time' => 'Working hours are 9:30 AM – 7:00 PM, Mon to Fri.',
                'hours' => 'Standard office hours are 9:30 AM to 7:00 PM.',
                'late' => 'Please inform your manager if you’re late. Frequent delays may affect your appraisal.',
                'delay' => 'Let your manager know if you’re delayed. Repeated delays are monitored.',

                // Work Flexibility
                'remote' => 'Remote work is allowed with manager approval.',
                'wfh' => 'Work from home is available upon request and approval.',

                // Dress Code
                'dress' => 'Smart casuals from Mon–Thu, casuals on Fridays.',
                'code' => 'Dress code: Smart casuals on weekdays; casual Fridays!',
                'clothing' => 'We follow a smart casual dress code with casual Fridays.',

                // ID and Security
                'id' => 'Lost your ID? Contact the admin team for a replacement.',
                'idcard' => 'Please inform admin if you lose your ID card.',
                'badge' => 'For lost badges, please reach out to admin for reissuance.',

                // Onboarding / Exit
                'probation' => 'The standard probation period is 3 months.',
                'probation period' => 'Employees are on a 3-month probation when joining.',
                'notice' => 'Notice period is 30 days. Submit resignation through the HR portal.',
                'resignation' => 'Submit your resignation through the HR portal with 30 days’ notice.',
                'resign' => 'Use the HR portal to resign. Notice period: 30 days.',
                'trial' => 'New hires undergo a 3-month trial (probation) period.',

                // Internships
                'internship' => 'Yes, internships are available. Contact HR for open roles.',
                'intern' => 'We offer internships! Reach out to HR to learn more.',

                // Letters
                'experience' => 'Experience letters are issued after resignation, upon request.',
                'letter' => 'Request your experience letter from HR after you exit.',

                // Escalations
                'manager' => 'Facing an issue? Talk to your reporting manager or HR.',
                'reporting' => 'Reach out to your manager or HR for help.',
                'supervisor' => 'Please contact your supervisor or HR if needed.',

                // Documents / Policies
                'policy' => 'Company policies are available in the HR portal under "Documents".',
                'policies' => 'You can find all HR policies in the "Documents" section of the HR portal.',
                'rules' => 'HR rules and policies are stored in the portal under "Documents".',

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


