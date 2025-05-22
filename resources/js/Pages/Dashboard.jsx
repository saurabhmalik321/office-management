import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { handleDownloadPdf } from '../Components/pdf';
import LoadingSpinner from '../Components/LoadingSpinner';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

export default function Dashboard({ auth, authUserRole }) {
    const [users, setUsers] = useState([]);
    const [leavesRequested, setLeavesRequested] = useState(0);
    const [payroll, setPayroll] = useState([]);
    const [activeEmployees, setActiveEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [salary, setSalaries] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);

    const isAuthorized = authUserRole === 'admin' || authUserRole === 'hr';

    const toggleUserHistory = (userId) => {
        setExpandedUserId(prevId => (prevId === userId ? null : userId));
    };

    const pendingLeave = () => {
        axios
            .get('/admin/pending-leave')
            .then((response) => setCount(response.data))
            .catch((error) => console.error('Error fetching leaves:', error));
    };

    useEffect(() => {
        axios.get('/salary-status')
            .then((response) => setSalaries(response.data))
            .catch((error) => console.error('Error fetching salary status:', error))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isAuthorized) return setLoading(false);

        const fetchData = async () => {
            try {
                const [userRes, leaveRes] = await Promise.all([
                    axios.get('/list'),
                    axios.get('/leaves'),
                ]);

                const userList = userRes.data;
                const leaveList = leaveRes.data;

                setUsers(userList);
                setLeavesRequested(leaveList.length);

                const totalPayroll = userList.reduce((sum, user) => sum + Number(user.salary || 0), 0);

                if (!isFinite(totalPayroll) || totalPayroll <= 0) {
                    setPayroll('Unable to calculate');
                } else {
                    const formatted = totalPayroll.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 0
                    });
                    setPayroll(formatted);
                }

                setActiveEmployees(userList.filter((u) => u.status === 1).length);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        pendingLeave();
    }, [authUserRole]);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-extrabold text-indigo-900">Your Dashboard</h2>}
            count={count}
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gradient-to-r from-indigo-50 to-indigo-100 min-h-screen">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-10">
                    {loading ? (
                        <LoadingSpinner />
                    ) : isAuthorized ? (
                        <>
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <DashboardCard label="Total Users" value={users.length} color="blue" />
                                <DashboardCard label="Leaves Requested" value={leavesRequested} color="purple" />
                                <DashboardCard label="Monthly Payroll" value={payroll} color="green" />
                                <DashboardCard label="Active Employees" value={activeEmployees} color="orange" />
                            </div>

                            {/* User Table */}
                            <div className="bg-white shadow-xl rounded-2xl mt-10 p-8">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">All Users</h3>
                                <div className="overflow-x-auto rounded-lg">
                                    <table className="min-w-full text-sm text-gray-800">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-medium">Name</th>
                                                <th className="px-6 py-4 text-left font-medium">Email</th>
                                                <th className="px-6 py-4 text-left font-medium">Salary</th>
                                                <th className="px-6 py-4 text-left font-medium">Role</th>
                                                <th className="px-6 py-4 text-left font-medium">Status</th>
                                                <th className="px-6 py-4 text-left font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <>
                                                    <tr key={user.id} className="hover:bg-gray-100">
                                                        <td className="px-6 py-4">{user.name}</td>
                                                        <td className="px-6 py-4">{user.email}</td>
                                                        <td className="px-6 py-4">
                                                            {user.salary
                                                                ? Number(user.salary).toLocaleString('en-IN', {
                                                                    style: 'currency',
                                                                    currency: 'INR',
                                                                    minimumFractionDigits: 0
                                                                })
                                                                : 'Not available'}
                                                        </td>
                                                        <td className="px-6 py-4">{user.user_role || 'No role assigned'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-4 py-2 text-xs font-semibold rounded-full ${user.status === 1 ? 'bg-[#c0feb4] text-green-950' : 'bg-red-100 text-red-800'}`}>
                                                                {user.status === 1 ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button onClick={() => toggleUserHistory(user.id)}>
                                                                <RemoveRedEyeIcon className="text-indigo-600 hover:text-indigo-800 cursor-pointer" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedUserId === user.id && (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                                <div className="space-y-2">
                                                                    {user.history ? (
                                                                        <div className="p-3 rounded-lg bg-white border border-gray-300 shadow-sm">
                                                                            <p>
                                                                                <strong>{user.history.user?.name} : </strong> {user.history.description}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">
                                                                                {new Date(user.history.created_at).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center text-gray-500 italic">No history found</div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-gray-800">
                            <h2 className="text-3xl font-extrabold mb-6">Welcome back, {auth.user.name}</h2>
                            <p className="text-lg mb-8">Here’s your personalized employee dashboard.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-blue-100 p-8 rounded-xl shadow-lg">
                                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Your Details</h3>
                                    <p><span className="font-medium">Name:</span> {auth.user.name}</p>
                                    <p><span className="font-medium">Email:</span> {auth.user.email}</p>
                                    <p><span className="font-medium">Salary:</span> {auth.user.salary ? Number(auth.user.salary).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'Not available'}</p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            auth.user.status === 1 ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                                        }`}>
                                            {auth.user.status === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                </div>

                                {(salary[0]?.status === 'paid') ? (
                                    <div className="bg-blue-100 p-8 rounded-xl shadow-lg flex items-center justify-center text-center">
                                        <h3 className="text-xl font-semibold text-green-700 mb-4">Latest Payslip</h3>
                                        {auth.user.status === 1 ? (
                                            <>
                                                <p className="text-gray-700">You can download your latest salary receipt below.</p>
                                                <button
                                                    onClick={() => handleDownloadPdf({
                                                        user: auth.user.name,
                                                        amount: auth.user.salary || 0,
                                                        status: auth.user.status === 1 ? 'paid' : 'pending',
                                                        date: new Date(),
                                                    })}
                                                    className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                                                >
                                                    Download Payslip
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-gray-700"> 🚫 Your salary status is pending. <br /> ⚠️ We’ll notify once updated.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-700 flex items-center justify-center text-center">
                                        🚫 Your salary status is pending. <br /> ⚠️ We’ll notify once updated.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function DashboardCard({ label, value, color }) {
    const bgColorMap = {
        blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
        green: 'bg-gradient-to-r from-green-500 to-green-600',
        purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
        orange: 'bg-gradient-to-r from-orange-400 to-orange-500',
    };

    return (
        <div className={`${bgColorMap[color]} text-white p-8 rounded-xl shadow-lg`}>
            <p className="text-sm uppercase tracking-wide font-medium">{label}</p>
            <p className="text-4xl font-semibold mt-2">{value}</p>
        </div>
    );
}
