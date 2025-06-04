<?php
namespace App\Repositories;
use App\Models\User;
use App\Models\Notification;
use App\Interface\UserInterface;
use App\Models\Salary;
use Illuminate\Support\Facades\Auth;
use App\Models\Inquiry;
class UserRepository implements UserInterface
{
    public function all()
    {
        return User::with('history.user')->get();
    }
    public function find($id)
    {
         $user = User::with(['leaves', 'salary','history.user'])->find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $user->direct_salary = $user->salary; 
        return $user;

    }

    public function create(array $data)
    {
        $user = new User();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->user_role = $data['user_role'];
        $user->password = bcrypt($data['password']); 
        $user->salary = $data['salary'];
        $user->save();

        $salary = new Salary();
        $salary->user_id = $user->id;
        $salary->amount = $user->salary;
        $salary->date = $user->created_at; 
        $salary->status = 'pending';
        $salary->save(); 
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
        return User::with('salary_calculator')->where('user_role', 'employee')->get();
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
    public function handleMessage(array $data)
    {
        $userMessage = $data['message'];
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
            return response()->json($botReply);
    }
    public function getAdminHrUsers()
    {
        $user = User::whereIn('user_role',['hr','admin'])->get();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
    return $user;
    }
    public function sendInquiry(array $data){
         $inquiry = Inquiry::create([
            'user_id' => $data['to_user_id'],
            'type' => $data['type'],
            'message' => $data['message'],
            'employee_id' => Auth::id(),
        ]);
        return  $inquiry;
    }
    public function getInquiry($id){
        return Inquiry::with('user')->where('user_id',$id)->get();
    }
}


