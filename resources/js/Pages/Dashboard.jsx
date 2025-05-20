import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { handleDownloadPdf } from '../Components/pdf';
import LoadingSpinner from '../Components/LoadingSpinner'; 

export default function Dashboard({ auth, authUserRole }) {
    const [users, setUsers] = useState([]);
    const [leavesRequested, setLeavesRequested] = useState(0);
    const [payroll, setPayroll] = useState([]);
    const [activeEmployees, setActiveEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAuthorized = authUserRole === 'admin' || authUserRole === 'hr';

    useEffect(() => {
        if (!isAuthorized) return setLoading(false);

        const fetchData = async () => {
            try {
                const [userRes, leaveRes] = await Promise.all([
                    axios.get('/list'),          // GET all users
                    axios.get('/leaves'),        // GET all leave requests
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
                    setPayroll(formatted); // e.g. ₹5,00,000.00
                }

                setActiveEmployees(userList.filter(u => u.status === 1).length);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authUserRole]);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold text-gray-800">Your Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-10 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {loading ? (
                        // Use the LoadingSpinner component here
                        <LoadingSpinner />
                    ) : isAuthorized ? (
                        <>
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <DashboardCard label="Total Users" value={users.length} color="blue" />
                                <DashboardCard label="Leaves Requested" value={leavesRequested} color="purple" />
                                <DashboardCard label="Monthy Payroll" value={payroll} color="green" />
                                <DashboardCard label="Active Employees" value={activeEmployees} color="orange" />
                            </div>

                            {/* User Table */}
                            <div className="bg-white rounded-xl shadow mt-6">
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">User Directory</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-gray-700">
                                            <thead className="bg-gray-100 border-b text-gray-600 capitalize tracking-wide">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Name</th>
                                                    <th className="px-4 py-3 text-left">Email</th>
                                                    <th className="px-4 py-3 text-left">Salary</th>
                                                    <th className="px-4 py-3 text-left">Role</th>
                                                    <th className="px-4 py-3 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(user => (
                                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-4 py-3 font-medium capitalize">{user.name}</td>
                                                        <td className="px-4 py-3">{user.email}</td>
                                                        <td className="px-4 py-3">{user.salary ? Number(user.salary).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }) : 'No salary detected'}</td>
                                                        <td className="px-4 py-3 capitalize">{user.user_role || 'No role given'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${
                                                                user.status === 1
                                                                    ? 'border border-green-500 text-green-700 text-sm font-medium rounded-full'
                                                                    : 'border border-red-500 text-red-700 text-sm font-medium rounded-full'
                                                            }`}>
                                                                {user.status === 1 ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow p-6 text-gray-800">
                            <h2 className="text-2xl font-bold mb-4">Welcome back, {auth.user.name}</h2>
                            <p className="text-lg mb-6">Here’s your personalized employee dashboard.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-100 p-6 rounded-lg shadow">
                                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Your Details</h3>
                                    <p><span className="font-medium">Name:</span> {auth.user.name}</p>
                                    <p><span className="font-medium">Email:</span> {auth.user.email}</p>
                                    <p><span className="font-medium">Salary:</span> {auth.user.salary ? Number(auth.user.salary).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'Not available'}</p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                                            auth.user.status === 1 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                                        }`}>
                                            {auth.user.status === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-green-800 mb-2">Latest Payslip</h3>
                                        <p className="text-gray-700">You can download your latest salary receipt below.</p>
                                    </div>
                                    <button
                                    onClick={() =>
                                        handleDownloadPdf({
                                        user: auth.user,
                                        amount: auth.user.salary || 0,
                                        status: auth.user.status === 1 ? 'paid' : 'pending',
                                        date: new Date(), // or fetch from DB if available
                                        })
                                    }
                                    className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
                                    >
                                    Download Payslip
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// DashboardCard component
function DashboardCard({ label, value, color }) {
    const bgColorMap = {
        blue: 'bg-gradient-to-r from-blue-500 to-blue-700',
        green: 'bg-gradient-to-r from-green-500 to-green-700',
        purple: 'bg-gradient-to-r from-purple-500 to-purple-700',
        orange: 'bg-gradient-to-r from-orange-400 to-orange-600',
    };

    return (
        <div className={`${bgColorMap[color]} text-white p-6 rounded-xl shadow-md`}>
            <p className="text-sm uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
}
