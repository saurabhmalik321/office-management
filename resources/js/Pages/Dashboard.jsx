// npm install axios chart.js react-chartjs-2

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { handleDownloadPdf } from '../Components/pdf';
import LoadingSpinner from '../Components/LoadingSpinner';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import {
    Avatar,
    Chip,
    CircularProgress,
    Collapse,
    IconButton,
    Skeleton
} from '@mui/material';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
);

export default function Dashboard({ auth, authUserRole }) {
    const [users, setUsers] = useState([]);
    const [leavesRequested, setLeavesRequested] = useState(0);
    const [payroll, setPayroll] = useState([]);
    const [activeEmployees, setActiveEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [salary, setSalaries] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [performanceData, setPerformanceData] = useState([]);

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
        // Mock performance data - this must come from an API
        setPerformanceData([
            { month: 'Jan', value: 65 },
            { month: 'Feb', value: 59 },
            { month: 'Mar', value: 80 },
            { month: 'Apr', value: 81 },
            { month: 'May', value: 56 },
            { month: 'Jun', value: 55 },
            { month: 'Jul', value: 40 },
            { month: 'Ago', value: 65 },
            { month: 'Sep', value: 59 },
            { month: 'Oct', value: 80 },
            { month: 'Nov', value: 81 },
            { month: 'Dec', value: 56 }

        ]);
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

    // Chart data with modern color schemes
    const userStatusChart = {
        labels: ['Active', 'Inactive'],
        datasets: [
            {
                label: 'Employees',
                data: [
                    activeEmployees,
                    users.length - activeEmployees
                ],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2,
                hoverOffset: 10,
                cutout: '70%',
            },
        ],
    };

    const payrollBarChart = {
        labels: users.map(u => u.name.split(' ')[0]), // Show only first names
        datasets: [
            {
                label: 'Salary',
                data: users.map(u => Number(u.salary || 0)),
                backgroundColor: '#3b82f6',
                borderRadius: 6,
                hoverBackgroundColor: '#2563eb',
            },
        ],
    };

    const performanceLineChart = {
        labels: performanceData.map(item => item.month),
        datasets: [
            {
                label: 'Performance',
                data: performanceData.map(item => item.value),
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#3b82f6',
                pointHoverBorderColor: '#fff',
                pointHitRadius: 10,
                pointBorderWidth: 2,
            }
        ]
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>}
            count={count}
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {loading ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} variant="rounded" height={120} />
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Skeleton variant="rounded" height={400} />
                                <Skeleton variant="rounded" height={400} />
                            </div>
                            <Skeleton variant="rounded" height={500} />
                        </div>
                    ) : isAuthorized ? (
                        <>
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <DashboardCard
                                    label="Total Users"
                                    value={users.length}
                                    icon="👥"
                                    trend="up"
                                    trendValue="12%"
                                />
                                <DashboardCard
                                    label="Leaves Requested"
                                    value={leavesRequested}
                                    icon="🍃"
                                    trend="down"
                                    trendValue="5%"
                                />
                                <DashboardCard
                                    label="Monthly Payroll"
                                    value={payroll}
                                    icon="💰"
                                    trend="up"
                                    trendValue="18%"
                                />
                                <DashboardCard
                                    label="Active Employees"
                                    value={activeEmployees}
                                    icon="✅"
                                    trend="neutral"
                                />
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Status</h3>
                                    <div className="h-64">
                                        <Doughnut data={userStatusChart} options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                tooltip: {
                                                    backgroundColor: '#1f2937',
                                                    titleColor: '#f9fafb',
                                                    bodyColor: '#f9fafb',
                                                    padding: 12,
                                                    cornerRadius: 8,
                                                    usePointStyle: true,
                                                },
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        padding: 20,
                                                        usePointStyle: true,
                                                        pointStyle: 'circle',
                                                        font: {
                                                            family: 'Inter, sans-serif'
                                                        }
                                                    }
                                                }
                                            },
                                            cutout: '65%',
                                        }} />
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Distribution</h3>
                                    <div className="h-64">
                                        <Bar data={payrollBarChart} options={{
                                            maintainAspectRatio: false,
                                            responsive: true,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: {
                                                        drawBorder: false,
                                                    },
                                                    ticks: {
                                                        callback: (value) => `₹${value.toLocaleString('en-IN')}`,
                                                        font: {
                                                            family: 'Inter, sans-serif'
                                                        }
                                                    },
                                                },
                                                x: {
                                                    grid: {
                                                        display: false,
                                                        drawBorder: false
                                                    },
                                                    ticks: {
                                                        font: {
                                                            family: 'Inter, sans-serif'
                                                        }
                                                    }
                                                }
                                            },
                                            plugins: {
                                                tooltip: {
                                                    backgroundColor: '#1f2937',
                                                    titleColor: '#f9fafb',
                                                    bodyColor: '#f9fafb',
                                                    padding: 12,
                                                    cornerRadius: 8,
                                                    usePointStyle: true,
                                                    callbacks: {
                                                        label: (context) => {
                                                            return `Salary: ₹${context.raw.toLocaleString('en-IN')}`;
                                                        }
                                                    }
                                                },
                                                legend: {
                                                    display: false
                                                }
                                            }
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Performance Trend */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Trend</h3>
                                <div className="h-64">
                                    <Line data={performanceLineChart} options={{
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    padding: 20,
                                                    usePointStyle: true,
                                                    font: {
                                                        family: 'Inter, sans-serif'
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: '#1f2937',
                                                titleColor: '#f9fafb',
                                                bodyColor: '#f9fafb',
                                                padding: 12,
                                                cornerRadius: 8,
                                            }
                                        },
                                        scales: {
                                            y: {
                                                suggestedMin: 0,
                                                suggestedMax: 100,
                                                grid: {
                                                    drawBorder: false,
                                                },
                                                ticks: {
                                                    font: {
                                                        family: 'Inter, sans-serif'
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false,
                                                    drawBorder: false
                                                },
                                                ticks: {
                                                    font: {
                                                        family: 'Inter, sans-serif'
                                                    }
                                                }
                                            }
                                        }
                                    }} />
                                </div>
                            </div>

                            {/* User Table */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Employee Directory</h3>
                                    <div className="text-sm text-gray-500">
                                        {users.length} employees
                                    </div>
                                </div>
                                <div className="overflow-x-auto hide-scrollbar">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Employee
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Salary
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <>
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Avatar className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 capitalize">
                                                                    {user.name.charAt(0)}
                                                                </Avatar>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900 capitalize">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 capitalize">{user.user_role || 'No role assigned'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {user.salary
                                                                    ? Number(user.salary).toLocaleString('en-IN', {
                                                                        style: 'currency',
                                                                        currency: 'INR',
                                                                        minimumFractionDigits: 0
                                                                    })
                                                                    : 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-block px-4 py-2 text-xs font-semibold rounded-full ${user.status === 1 ? 'bg-[#c0feb4] text-green-950' : 'bg-red-100 text-red-800'}`}>
                                                                {user.status === 1 ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap ">
                                                            <IconButton
                                                                onClick={() => toggleUserHistory(user.id)}
                                                                size="small"
                                                                color="primary"
                                                            >
                                                                {expandedUserId === user.id ? <ExpandLess /> : <ExpandMore />}
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-0">
                                                            <Collapse in={expandedUserId === user.id} timeout="auto" unmountOnExit>
                                                                <div className="bg-gray-50 p-4">
                                                                    <div className="space-y-2">
                                                                        {user.history ? (
                                                                            <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-xs">
                                                                                <p className="text-sm font-medium text-gray-900">
                                                                                    <span className="font-semibold">{user.history.user?.name}</span>: {user.history.description}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    {new Date(user.history.created_at).toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center text-gray-500 text-sm italic py-2">No history found for this employee</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Collapse>
                                                        </td>
                                                    </tr>
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-8">
                            {/* Employee Welcome Section */}
                            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {auth.user.name}</h2>
                                        <p className="text-lg text-gray-600">Here's your personalized dashboard for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <span className={`inline-block px-4 py-2 text-xs font-semibold rounded-full
                                         ${auth.user.status === 1 ? 'bg-[#c0feb4] text-green-950' : 'bg-red-100 text-red-800'}`}>
                                         {auth.user.status === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Employee Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="text-base font-medium text-gray-900">{auth.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <p className="text-base font-medium text-gray-900">{auth.user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Role</p>
                                            <p className="text-base font-medium text-gray-900 capitalize">{auth.user.user_role || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Compensation</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Monthly Salary</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {auth.user.salary
                                                    ? Number(auth.user.salary).toLocaleString('en-IN', {
                                                        style: 'currency',
                                                        currency: 'INR',
                                                        minimumFractionDigits: 0
                                                    })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Payment Status</p>
                                            <div className="flex items-center">
                                                {salary[0]?.status === 'paid' ? (
                                                    <>
                                                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                                        <span className="text-sm font-medium text-green-700">Paid</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                                                        <span className="text-sm font-medium text-yellow-700">Pending</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        {salary[0]?.status === 'paid' ? (
                                            <button
                                                onClick={() => handleDownloadPdf({
                                                    user: auth.user.name,
                                                    amount: auth.user.salary || 0,
                                                    status: 'paid',
                                                    date: new Date(),
                                                })}
                                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                            >
                                                Download Payslip
                                            </button>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-center">
                                                <p className="text-sm text-yellow-700">
                                                  ⚠️ Your salary status is pending. We'll notify you once updated.
                                                </p>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => window.location.href = '/manageleaves'}
                                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                        >
                                            Request Time Off
                                        </button>
                                        <button
                                            onClick={() => window.location.href = '/profile'}
                                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                        >
                                            Update Profile
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h3>
                                <div className="h-64">
                                    <Line data={performanceLineChart} options={{
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                backgroundColor: '#1f2937',
                                                titleColor: '#f9fafb',
                                                bodyColor: '#f9fafb',
                                                padding: 12,
                                                cornerRadius: 8,
                                            }
                                        },
                                        scales: {
                                            y: {
                                                suggestedMin: 0,
                                                suggestedMax: 100,
                                                grid: {
                                                    drawBorder: false,
                                                },
                                                ticks: {
                                                    font: {
                                                        family: 'Inter, sans-serif'
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false,
                                                    drawBorder: false
                                                },
                                                ticks: {
                                                    font: {
                                                        family: 'Inter, sans-serif'
                                                    }
                                                }
                                            }
                                        }
                                    }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function DashboardCard({ label, value, icon, trend, trendValue }) {
    const trendColors = {
        up: 'text-green-600 bg-green-100',
        down: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→'
    };



    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                    <span className="text-xl">{icon}</span>
                </div>
            </div>
            {trend && (
                <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendColors[trend]}`}>
                    {trendIcons[trend]} {trendValue || 'No change'} from last month
                </div>
            )}
        </div>
    );
}
