import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Dashboard({ authUserRole }) {
    const [users, setUsers] = useState([]);
    const [leavesRequested, setLeavesRequested] = useState(0);
    const [departments, setDepartments] = useState(0);
    const [activeEmployees, setActiveEmployees] = useState(0);
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

        setDepartments(new Set(userList.map(u => u.department)).size || 0);
        setActiveEmployees(userList.filter(u => u.status === 'active').length);
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
            header={<h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-10 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {loading ? (
                        <div className="text-center text-gray-500 text-lg font-medium">Loading dashboard...</div>
                    ) : isAuthorized ? (
                        <>
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <DashboardCard label="Total Users" value={users.length} color="blue" />
                                <DashboardCard label="Leaves Requested" value={leavesRequested} color="purple" />
                                <DashboardCard label="Departments" value={departments} color="green" />
                                <DashboardCard label="Active Employees" value={activeEmployees} color="orange" />
                            </div>

                            {/* User Table */}
                            <div className="bg-white rounded-xl shadow mt-6">
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">User Directory</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-gray-700">
                                            <thead className="bg-gray-100 border-b text-gray-600 uppercase tracking-wide">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Name</th>
                                                    <th className="px-4 py-3 text-left">Email</th>
                                                    <th className="px-4 py-3 text-left">Department</th>
                                                    <th className="px-4 py-3 text-left">Role</th>
                                                    <th className="px-4 py-3 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(user => (
                                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-4 py-3 font-medium">{user.name}</td>
                                                        <td className="px-4 py-3">{user.email}</td>
                                                        <td className="px-4 py-3">{user.department || 'N/A'}</td>
                                                        <td className="px-4 py-3 capitalize text-blue-600 font-semibold">{users.role}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                                user.status === 'active'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {user.status || 'unknown'}
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
                        <div className="bg-white rounded-xl shadow p-6 text-center text-red-500 font-semibold">
                            🚫 You are not authorized to view this dashboard.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ✅ DashboardCard component with colorful gradient backgrounds
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
