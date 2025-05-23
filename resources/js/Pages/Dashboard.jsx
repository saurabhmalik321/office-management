import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import {
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
import { Doughnut, Line } from 'react-chartjs-2';
import {
    Avatar,
    Skeleton,
    Button,
    CircularProgress
} from '@mui/material';
import ChartJS from 'chart.js/auto';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { handleDownloadPdf } from '../Components/pdf';
import { motion } from 'framer-motion';

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
    const [leaveData, setLeaveData] = useState({
        pending: 0,
        accepted: 0,
        requested: 0,
        upcoming: []
    });
    const [payroll, setPayroll] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sectionLoading, setSectionLoading] = useState({ leaves: false, charts: false });
    const [salary, setSalaries] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);
    const [count, setCount] = useState(0);

    const isAuthorized = authUserRole === 'admin' || authUserRole === 'hr';
     const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    useEffect(() => {
        axios.get('/admin/performance')
            .then((response) => setPerformanceData(response.data))
            .catch((error) => console.error('Error fetching performances:', error));
    }, []);
       const performanceLineChart = useMemo(() => {
        if (!performanceData || performanceData.length === 0) return { labels: [], datasets: [] };

        const usersMap = {};
        performanceData.forEach(item => {
            const userName = item.user?.name || 'Unknown';
            if (!usersMap[userName]) {
                usersMap[userName] = {};
            }
            usersMap[userName][item.evaluated_at] = item.score;
        });

        const allDates = Array.from(new Set(performanceData.map(item => item.evaluated_at))).sort();

        const datasets = Object.entries(usersMap).map(([userName, scoresByDate]) => ({
            label: userName,
            data: allDates.map(date => scoresByDate[date] ?? 0),
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            tension: 0.4,
            fill: false,
        }));

        return { labels: allDates, datasets };
    }, [performanceData]);

    useEffect(() => {
        axios.get('/available-years')
            .then(response => {
                setAvailableYears(["data"]);
            })
            .catch(error => {
                console.error('Error fetching available years:', error);
                setAvailableYears([new Date().getFullYear()]);
            });
    }, []);

    const pendingLeave = () => {
        axios
            .get('/admin/pending-leave')
            .then((response) => setCount(response.data))
            .catch((error) => console.error('Error fetching leaves:', error));
    };

    useEffect(() => {
        fetchData();
        pendingLeave();
    }, []);

    const fetchData = async () => {
        try {
            setSectionLoading(prev => ({ ...prev, leaves: true }));
            const [userRes, leaveRes] = await Promise.all([
                axios.get('/list', {
                    params: {
                        month: selectedMonth,
                        year: selectedYear
                    }
                }),
                axios.get('/leaves', {
                    params: {
                        month: selectedMonth,
                        year: selectedYear
                    }
                }),
            ]);

            const userList = userRes.data;
            const leaveList = leaveRes.data;

            setUsers(userList);

            const pending = leaveList.filter(l => l.status === 'pending').length;
            const accepted = leaveList.filter(l => l.status === 'accepted' || l.status === 'approved').length;
            const requested = leaveList.length;
            const upcoming = leaveList
                .filter(l =>
                    (l.status === 'accepted' || l.status === 'approved') &&
                    new Date(l.start_date) > new Date() &&
                    (selectedMonth === 0 || new Date(l.start_date).getMonth() + 1 === selectedMonth) &&
                    (selectedYear === 0 || new Date(l.start_date).getFullYear() === selectedYear)
                )
                .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

            setLeaveData({
                pending,
                accepted,
                requested,
                upcoming
            });

            const totalPayroll = userList.reduce((sum, user) => sum + Number(user.salary || 0), 0);

            if (!isFinite(totalPayroll) || totalPayroll <= 0) {
                setPayroll('N/A');
            } else {
                const formatted = totalPayroll.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0
                });
                setPayroll(formatted);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
            setSectionLoading(prev => ({ ...prev, leaves: false }));
        }
    };

    useEffect(() => {
        if (!isAuthorized) {
            setLoading(false);
            return;
        }
        fetchData();
    }, [authUserRole, selectedMonth, selectedYear]);

    useEffect(() => {
        axios.get('/salary-status', {
            params: {
                month: selectedMonth,
                year: selectedYear
            }
        })
            .then((response) => setSalaries(response.data))
            .catch((error) => console.error('Error fetching salary status:', error))
            .finally(() => setLoading(false));
    }, [selectedMonth, selectedYear]);

    // useEffect(() => {
    //     setSectionLoading(prev => ({ ...prev, charts: true }));
    //     axios.get('/performance-data', {
    //         params: {
    //             month: selectedMonth,
    //             year: selectedYear
    //         }
    //     })
    //         .then(response => {
    //             setPerformanceData(response.data);
    //         })
    //         .catch(error => {
    //             console.error('Error fetching performance data:', error);
    //             setPerformanceData([
    //                 { month: 'Jan', value: 65 },
    //                 { month: 'Feb', value: 59 },
    //                 { month: 'Mar', value: 80 },
    //                 { month: 'Apr', value: 81 },
    //                 { month: 'May', value: 56 },
    //                 { month: 'Jun', value: 55 },
    //                 { month: 'Jul', value: 40 },
    //                 { month: 'Aug', value: 65 },
    //                 { month: 'Sep', value: 59 },
    //                 { month: 'Oct', value: 80 },
    //                 { month: 'Nov', value: 81 },
    //                 { month: 'Dec', value: 56 }
    //             ]);
    //         })
    //         .finally(() => setSectionLoading(prev => ({ ...prev, charts: false })));
    // }, [selectedMonth, selectedYear]);

    const MonthYearFilter = () => {
        const handleMonthChange = (e) => {
            const newMonth = parseInt(e.target.value);
            setSectionLoading(prev => ({ ...prev, leaves: true, charts: true }));
            setSelectedMonth(newMonth);
            if (newMonth > 0 && selectedYear === 0) {
                setSelectedYear(new Date().getFullYear());
            }
        };

        const handleYearChange = (e) => {
            setSectionLoading(prev => ({ ...prev, leaves: true, charts: true }));
            setSelectedYear(parseInt(e.target.value));
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Data</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label htmlFor="month" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Month
                        </label>
                        <select
                            id="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            aria-label="Select month for filtering data"
                            className="block w-full sm:w-40 rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="0">All Months</option>
                            {months.map((month, index) => (
                                <option key={month} value={index + 1}>{month}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label htmlFor="year" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Year
                        </label>
                        <select
                            id="year"
                            value={selectedYear}
                            onChange={handleYearChange}
                            aria-label="Select year for filtering data"
                            className="block w-full sm:w-32 rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="0">All Years</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {sectionLoading.leaves || sectionLoading.charts ? (
                    <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                        <CircularProgress size={16} sx={{ color: '#4F46E5' }} />
                        Updating data...
                    </div>
                ) : null}
            </motion.div>
        );
    };

    const leaveStatusChart = useMemo(() => ({
        labels: ['Pending', 'Accepted', 'Requested'],
        datasets: [
            {
                label: 'Leaves',
                data: [
                    leaveData.pending,
                    leaveData.accepted,
                    leaveData.requested
                ],
                backgroundColor: ['#f59e0b', '#14b8a6', '#4f46e5'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 2,
                hoverOffset: 15,
                cutout: '70%',
            },
        ],
    }), [leaveData]);



    const getCardTitle = (baseTitle) => {
        if (selectedMonth === 0 && selectedYear === 0) {
            return baseTitle;
        }

        let period = '';
        if (selectedMonth > 0) period += months[selectedMonth - 1];
        if (selectedYear > 0) {
            period += period ? ` ${selectedYear}` : `${selectedYear}`;
        } else if (selectedMonth > 0) {
            period += ` ${new Date().getFullYear()}`;
        }

        return `${baseTitle} (${period})`;
    };
// if (loading) return <LoadingSpinner />;
    return (
        <AuthenticatedLayout
            // header={<h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>}
            count={count}
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {loading ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} variant="rounded" height={140} />
                                ))}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Skeleton variant="rounded" height={400} />
                                <Skeleton variant="rounded" height={400} />
                            </div>
                        </div>
                    ) : isAuthorized ? (
                        <>
                            {isAuthorized && <MonthYearFilter />}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                <DashboardCard
                                    label={getCardTitle("Total Employees")}
                                    value={users.length}
                                    trend="up"
                                    trendValue="12%"
                                    accentColor="indigo-500"
                                />
                                <DashboardCard
                                    label={getCardTitle("Leaves Requested")}
                                    value={leaveData.requested}
                                    trend="down"
                                    trendValue="5%"
                                    accentColor="teal-500"
                                />
                                <DashboardCard
                                    label={getCardTitle("Monthly Payroll")}
                                    value={payroll}
                                    trend="up"
                                    trendValue="18%"
                                    accentColor="purple-500"
                                />
                                <DashboardCard
                                    label={getCardTitle("Pending Leaves")}
                                    value={leaveData.pending}
                                    trend="neutral"
                                    accentColor="yellow-500"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                            >
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Leave Status - {months[selectedMonth - 1] || 'All'} {selectedYear || 'All'}
                                    </h3>
                                    {sectionLoading.charts ? (
                                        <div className="flex justify-center items-center h-64">
                                            <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
                                        </div>
                                    ) : (
                                        <div className="h-64">
                                            <Doughnut data={leaveStatusChart} options={{
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
                                                                family: 'Inter, sans-serif',
                                                                size: 14,
                                                                weight: 'bold'
                                                            },
                                                            color: '#1f2937'
                                                        }
                                                    }
                                                },
                                                cutout: '70%',
                                            }} />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow lg:col-span-2">
                                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Upcoming Leaves - {months[selectedMonth - 1] || 'All'} {selectedYear || 'All'}
                                        </h3>
                                        <div className="text-sm text-gray-600">
                                            {leaveData.upcoming.length} approved leaves
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        {sectionLoading.leaves ? (
                                            <div className="flex justify-center items-center h-40">
                                                <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
                                            </div>
                                        ) : leaveData.upcoming.length === 0 ? (
                                            <div className="text-center py-6 text-gray-600">
                                                No upcoming approved leaves found for this period.
                                            </div>
                                        ) : (
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50 sticky top-0 z-10">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                            Employee
                                                        </th>
                                                        <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                            Start Date
                                                        </th>
                                                        <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                            End Date
                                                        </th>
                                                        <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {leaveData.upcoming.slice(0, 5).map((leave, index) => {
                                                        const user = users.find(u => u.id === leave.user_id) || { name: 'Unknown', email: 'N/A' };
                                                        return (
                                                            <motion.tr
                                                                key={leave.id}
                                                                className="transition-colors hover:bg-gray-50"
                                                                whileHover={{ backgroundColor: '#F9FAFB' }}
                                                            >
                                                                <td className="px-6 py-3 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <Avatar className="h-8 w-8 rounded-full bg-teal-100 text-teal-600 capitalize">
                                                                            {user.name.charAt(0)}
                                                                        </Avatar>
                                                                        <div className="ml-3">
                                                                            <div className="text-sm font-medium text-gray-900 capitalize">{user.name}</div>
                                                                            <div className="text-xs text-gray-600">{user.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">
                                                                        {new Date(leave.start_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">
                                                                        {new Date(leave.end_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 capitalize">{leave.leave_type || 'N/A'}</div>
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap">
                                                                    <Button
                                                                        onClick={() => window.location.href = '/manageleaves'}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        aria-label={`View more details for ${user.name}'s leave`}
                                                                        sx={{
                                                                            textTransform: 'capitalize',
                                                                            padding: '4px 8px',
                                                                            borderColor: '#4F46E5',
                                                                            color: '#4F46E5',
                                                                            '&:hover': {
                                                                                borderColor: '#4338CA',
                                                                                backgroundColor: '#EEF2FF'
                                                                            }
                                                                        }}
                                                                    >
                                                                        View More
                                                                    </Button>
                                                                </td>
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    {leaveData.upcoming.length > 5 && (
                                        <div className="px-6 py-3 text-center">
                                            <Button
                                                onClick={() => window.location.href = '/manageleaves'}
                                                variant="contained"
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    padding: '6px 16px',
                                                    backgroundColor: '#4F46E5',
                                                    '&:hover': { backgroundColor: '#4338CA' }
                                                }}
                                                aria-label="View all approved leaves"
                                            >
                                                View All Approved Leaves
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Employee Performance Trend - {months[selectedMonth - 1] || 'All'} {selectedYear || 'All'}
                                </h3>
                                {sectionLoading.charts ? (
                                    <div className="flex justify-center items-center h-64">
                                        <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
                                    </div>
                                ) : (
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
                                                            family: 'Inter, sans-serif',
                                                            size: 14,
                                                            weight: 'bold'
                                                        },
                                                        color: '#1f2937'
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
                                                    suggestedMax: 10,
                                                    grid: {
                                                        drawBorder: false,
                                                        color: '#E5E7EB'
                                                    },
                                                    ticks: {
                                                        font: {
                                                            family: 'Inter, sans-serif',
                                                            size: 12
                                                        },
                                                        color: '#1f2937'
                                                    }
                                                },
                                                x: {
                                                    grid: {
                                                        display: false,
                                                        drawBorder: false
                                                    },
                                                    ticks: {
                                                        font: {
                                                            family: 'Inter, sans-serif',
                                                            size: 12
                                                        },
                                                        color: '#1f2937'
                                                    }
                                                }
                                            }
                                        }} />
                                    </div>
                                )}
                            </motion.div>
                        </>
                    ) : (
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {auth.user.name}</h2>
                                        <p className="text-lg text-gray-600">Your personalized dashboard for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <span className={`inline-block px-4 py-2 text-xs font-semibold rounded-full ${auth.user.status === 1 ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                                            {auth.user.status === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                            >
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Full Name</p>
                                            <p className="text-base font-medium text-gray-900">{auth.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email Address</p>
                                            <p className="text-base font-medium text-gray-900">{auth.user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Role</p>
                                            <p className="text-base font-medium text-gray-900 capitalize">{auth.user.user_role || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Compensation</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Monthly Salary</p>
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
                                            <p className="text-sm text-gray-600">Payment Status</p>
                                            <div className="flex items-center">
                                                {salary[0]?.status === 'paid' ? (
                                                    <>
                                                        <div className="h-2 w-2 rounded-full bg-teal-500 mr-2"></div>
                                                        <span className="text-sm font-medium text-teal-700">Paid</span>
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

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        {salary[0]?.status === 'paid' ? (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDownloadPdf({
                                                    user: auth.user.name,
                                                    amount: auth.user.salary || 0,
                                                    status: 'paid',
                                                    date: new Date(),
                                                })}
                                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                                                aria-label="Download payslip"
                                            >
                                                Download Payslip
                                            </motion.button>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-center">
                                                <p className="text-sm text-yellow-700">
                                                    ⚠️ Your salary status is pending. We'll notify you once updated.
                                                </p>
                                            </div>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => window.location.href = '/manageleaves'}
                                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                                            aria-label="Request time off"
                                        >
                                            Request Time Off
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => window.location.href = '/profile'}
                                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                                            aria-label="Update employee profile"
                                        >
                                            Update Employee Profile
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Your Performance
                                </h3>
                                {sectionLoading.charts ? (
                                    <div className="flex justify-center items-center h-64">
                                        <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
                                    </div>
                                ) : (
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
                                                    suggestedMax: 10,
                                                    grid: {
                                                        drawBorder: false,
                                                        color: '#E5E7EB'
                                                    },
                                                    ticks: {
                                                        font: {
                                                            family: 'Inter, sans-serif',
                                                            size: 12
                                                        },
                                                        color: '#1f2937'
                                                    }
                                                },
                                                x: {
                                                    grid: {
                                                        display: false,
                                                        drawBorder: false
                                                    },
                                                    ticks: {
                                                        font: {
                                                            family: 'Inter, sans-serif',
                                                            size: 12
                                                        },
                                                        color: '#1f2937'
                                                    }
                                                }
                                            }
                                        }} />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function DashboardCard({ label, value, trend, trendValue, accentColor }) {
    const trendColors = {
        up: 'text-teal-600 bg-teal-100',
        down: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→'
    };

    return (
        <motion.div
            whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
            {trend && (
                <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendColors[trend]}`}>
                    {trendIcons[trend]} {trendValue || 'No change'} from last month
                </div>
            )}
        </motion.div>
    );
}
