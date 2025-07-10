import { useEffect, useState, useMemo, useCallback } from 'react';
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
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Box,
    Popover,
    Typography,
    Select,
    MenuItem
} from '@mui/material';
import ChartJS from 'chart.js/auto';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { handleDownloadPdf } from '../Components/pdf';

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

// Utility to debounce API calls
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// In-memory cache for API responses
const cache = new Map();

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// DateFilter component
const DateFilter = ({ filterType, setFilterType, selectedMonth, setSelectedMonth, selectedDate, setSelectedDate, selectedYear, setSelectedYear, sectionLoading }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    // Define available years (last 5 years from current year)
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handleButtonClick = (event, newFilterType) => {
        if (newFilterType) {
            setFilterType(newFilterType);
            setAnchorEl(event.currentTarget);
            if (newFilterType === 'month') {
                const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
                setSelectedMonth(currentMonth);
            }
        }
    };

    const handleToggleButtonClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDateChange = (event) => {
        const dateString = event.target.value;
        if (!dateString) return;
        const newDate = new Date(dateString);
        if (!isNaN(newDate.getTime()) && newDate.getFullYear() === selectedYear) {
            if (filterType === 'month') {
                setSelectedMonth(newDate.getMonth() + 1);
            } else {
                setSelectedDate(newDate);
            }
            setAnchorEl(null);
        }
    };

    const handleYearChange = (event) => {
        const newYear = Number(event.target.value);
        setSelectedYear(newYear);
        // Reset month to current month and date when year changes
        const currentMonth = new Date().getMonth() + 1;
        setSelectedMonth(currentMonth);
        setSelectedDate(new Date(newYear, currentMonth - 1, 1));
        setAnchorEl(null);
    };

    const handleCalendarClose = () => {
        setAnchorEl(null);
    };

    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const open = Boolean(anchorEl);
    const id = open ? 'calendar-popover' : undefined;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <Typography variant="h6" className="text-lg font-semibold text-gray-900 mb-4">
                Filter Leaves
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ToggleButtonGroup
                    value={filterType}
                    exclusive
                    onChange={handleButtonClick}
                    aria-label="filter type"
                    sx={{ backgroundColor: '#F3F4F6', borderRadius: 2, p: 0.5 }}
                >
                    {['day', 'week', 'month', 'year'].map((type) => (
                        <ToggleButton
                            key={type}
                            value={type}
                            onClick={handleToggleButtonClick}
                            sx={{
                                textTransform: 'capitalize',
                                px: 3,
                                py: 1,
                                border: 'none',
                                borderRadius: 1,
                                backgroundColor: filterType === type ? '#4F46E5' : 'transparent',
                                color: filterType === type ? 'white' : '#374151',
                                fontWeight: 500,
                                '&:hover': { backgroundColor: filterType === type ? '#4338CA' : '#E5E7EB' }
                            }}
                        >
                            {type}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleCalendarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    sx={{ mt: 1 }}
                >
                    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        {filterType === 'year' ? (
                            <Select
                                value={selectedYear}
                                onChange={handleYearChange}
                                sx={{
                                    width: '120px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    backgroundColor: '#F9FAFB',
                                    '.MuiSelect-select': { py: 1 }
                                }}
                            >
                                {availableYears.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        ) : (
                            <input
                                type={filterType === 'month' ? 'month' : 'date'}
                                value={filterType === 'month' ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : formatDateForInput(selectedDate)}
                                onChange={handleDateChange}
                                min={filterType === 'month' ? `${selectedYear}-01` : `${selectedYear}-01-01`}
                                max={filterType === 'month' ? `${selectedYear}-12` : `${selectedYear}-12-31`}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    backgroundColor: '#F9FAFB',
                                    outline: 'none'
                                }}
                            />
                        )}
                    </Box>
                </Popover>
                {(sectionLoading.leaves || sectionLoading.charts) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CircularProgress size={16} sx={{ color: '#4F46E5' }} />
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            Updating data...
                        </Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
};

// DashboardCard component
const DashboardCard = ({ label, value, trend, trendValue, filterType }) => {
    const trendColors = {
        up: 'text-teal-600 bg-teal-100',
        down: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
    };
    const trendIcons = { up: '↑', down: '↓', neutral: '→' };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-600 capitalize tracking-wider">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
            {trend && (
                <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendColors[trend]}`}>
                    {trendIcons[trend]} {trendValue || 'No change'} from last {filterType === 'year' ? 'year' : 'month'}
                </div>
            )}
        </div>
    );
};

// LeaveStatusChart component
const LeaveStatusChart = ({ leaveData, sectionLoading }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>
            Leave Status
        </Typography>
        {sectionLoading.charts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256 }}>
                <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
            </Box>
        ) : (leaveData.pending + leaveData.accepted + leaveData.requested === 0) ? (
            <Typography sx={{ textAlign: 'center', py: 6, color: '#6B7280' }}>
                No leave data available for this period.
            </Typography>
        ) : (
            <div style={{ height: 256 }}>
                <Doughnut
                    data={{
                        labels: ['Pending', 'Accepted', 'Requested'],
                        datasets: [{
                            label: 'Leaves',
                            data: [leaveData.pending, leaveData.accepted, leaveData.requested],
                            backgroundColor: ['#F59E0B', '#14B8A6', '#4F46E5'],
                            borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                            borderWidth: 2,
                            hoverOffset: 15,
                            cutout: '70%'
                        }]
                    }}
                    options={{
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                backgroundColor: '#1F2937',
                                titleColor: '#F9FAFB',
                                bodyColor: '#F9FAFB',
                                padding: 12,
                                cornerRadius: 8,
                                usePointStyle: true
                            },
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    usePointStyle: true,
                                    pointStyle: 'circle',
                                    font: { size: 14, weight: '600' },
                                    color: '#1F2937'
                                }
                            }
                        },
                        cutout: '70%'
                    }}
                />
            </div>
        )}
    </div>
);

// UpcomingLeavesTable component
const UpcomingLeavesTable = ({ leaveData, users, sectionLoading, filterType, selectedDate, selectedMonth, selectedYear }) => {
    const [leaveFilter, setLeaveFilter] = useState('approved'); // Default to 'approved'

    const handleFilterChange = (event) => {
        setLeaveFilter(event.target.value);
    };

    // Filter leaves based on status and date filter
    const filteredLeaves = useMemo(() => {
        const now = new Date();
        return leaveData.upcoming.filter((leave) => {
            const leaveDate = new Date(leave.start_date);
            if (isNaN(leaveDate.getTime()) || leaveDate <= now) return false; // Ensure future leaves only

            // Status filter
            let statusMatch = false;
            if (leaveFilter === 'approved') {
                statusMatch = leave.status === 'accepted' || leave.status === 'approved';
            } else if (leaveFilter === 'requested') {
                statusMatch = leave.status === 'pending';
            }

            // Date filter
            let dateMatch = false;
            if (filterType === 'year') {
                dateMatch = leaveDate.getFullYear() === selectedYear;
            } else if (filterType === 'month') {
                dateMatch = leaveDate.getFullYear() === selectedYear && leaveDate.getMonth() + 1 === selectedMonth;
            } else if (filterType === 'week') {
                const weekStart = new Date(selectedDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                dateMatch = leaveDate >= weekStart && leaveDate <= weekEnd && leaveDate.getFullYear() === selectedYear;
            } else if (filterType === 'day') {
                dateMatch = leaveDate.toDateString() === selectedDate.toDateString() && leaveDate.getFullYear() === selectedYear;
            }

            return statusMatch && dateMatch;
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    }, [leaveData.upcoming, leaveFilter, filterType, selectedDate, selectedMonth, selectedYear]);

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow lg:col-span-2">
            <Box sx={{ px: 6, py: 4, borderBottom: 1, borderColor: '#E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                    Upcoming Leaves
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Select
                        value={leaveFilter}
                        onChange={handleFilterChange}
                        sx={{
                            height: '36px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            backgroundColor: '#F9FAFB',
                            '.MuiSelect-select': { py: 1, color: '#111827' },
                            '&:hover': { backgroundColor: '#EEF2FF' }
                        }}
                    >
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="requested">Requested</MenuItem>
                    </Select>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {filteredLeaves.length} {leaveFilter} leaves
                    </Typography>
                </Box>
            </Box>
            <div className="overflow-x-auto">
                {sectionLoading.leaves ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160 }}>
                        <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
                    </Box>
                ) : filteredLeaves.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', py: 6, color: '#6B7280' }}>
                        No {leaveFilter} leaves found for this period.
                    </Typography>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                {['Employee', 'Start Date', 'End Date', 'Type', 'Actions'].map((header) => (
                                    <th
                                        key={header}
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sm:text-sm"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLeaves.slice(0, 5).map((leave) => {
                                const user = users.find((u) => u.id === leave.user_id) || { name: 'Unknown', email: 'N/A' };
                                return (
                                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Typography variant="body2" sx={{ color: '#111827' }}>
                                                {new Date(leave.start_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
                                            </Typography>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Typography variant="body2" sx={{ color: '#111827' }}>
                                                {new Date(leave.end_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
                                            </Typography>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Typography variant="body2" sx={{ color: '#111827', textTransform: 'capitalize' }}>
                                                {leave.leave_type || 'N/A'}
                                            </Typography>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Button
                                                onClick={() => window.location.href = '/manage-leaves'}
                                                size="small"
                                                variant="outlined"
                                                aria-label={`View more details for ${user.name}'s leave`}
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderColor: '#4F46E5',
                                                    color: '#4F46E5',
                                                    borderRadius: '6px',
                                                    '&:hover': { borderColor: '#4338CA', backgroundColor: '#EEF2FF' }
                                                }}
                                            >
                                                View More
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {filteredLeaves.length > 5 && (
                <Box sx={{ px: 6, py: '12px', textAlign: 'center' }}>
                    <Button
                        onClick={() => window.location.href = '/manage-leaves'}
                        variant="contained"
                        color="primary"
                        sx={{
                            textTransform: 'capitalize',
                            '&:hover': { bgcolor: '#4338CA' }
                        }}
                    >
                        View all {leaveFilter} Leaves
                    </Button>
                </Box>
            )}
        </div>
    );
};

// PerformanceChart component
const PerformanceChart = ({ performanceData, sectionLoading, title }) => {
    const chartData = useMemo(() => {
        if (!performanceData?.length) return { labels: [], datasets: [] };
        const usersMap = {};
        performanceData.forEach((item) => {
            const userName = item.user?.name || 'Anonymous';
            if (!usersMap[userName]) usersMap[userName] = {};
            usersMap[userName][item.evaluated_at] = item.score;
        });
        const labels = Array.from(new Set(performanceData.map((item) => item.evaluated_at))).sort();
        const datasets = Object.entries(usersMap).map(([userName, scoresByDate], index) => ({
            label: userName,
            data: labels.map((date) => scoresByDate[date] ?? 0),
            borderColor: `hsl(${index * 137.5 % 360}, 70%, 50%)`,
            tension: 0.4,
            fill: false
        }));
        return { labels, datasets };
    }, [performanceData]);
    console.log(performanceData, 'performancedata');

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>{title}</Typography>
            {sectionLoading.charts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256 }}>
                    <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
                </Box>
            ) : !performanceData?.length ? (
                <Typography sx={{ textAlign: 'center', py: 6, color: '#6B7280' }}>
                    No performance data available for this period.
                </Typography>
            ) : (
                <div style={{ height: 256 }}>
                    <Line
                        data={chartData}
                        options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true,
                                        pointStyle: 'circle',
                                        font: { size: 12 },
                                        color: '#1F2937'
                                    }
                                },
                                tooltip: {
                                    backgroundColor: '#1F2937',
                                    titleColor: '#F9FAFB',
                                    bodyColor: '#F9FAFB',
                                    padding: 10,
                                    cornerRadius: 6,
                                    boxPadding: 6
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    suggestedMax: 10,
                                    grid: { color: '#E5E7EB' },
                                    ticks: { color: '#1F2937', stepSize: 2 }
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { color: '#1F2937' }
                                }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// EmployeeDashboard component
const EmployeeDashboard = ({ auth, salary, performanceData, sectionLoading }) => (
    <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                        Welcome back, {auth.user.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Your personalized dashboard for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                </Box>
                <Box>
                    <Typography
                        component="span"
                        sx={{
                            px: 2,
                            py: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '9999px',
                            bgcolor: auth.user.status === 1 ? '#CCFBF1' : '#FEE2E2',
                            color: auth.user.status === 1 ? '#0D9488' : '#B91C1C'
                        }}
                    >
                        {auth.user.status === 1 ? 'Active' : 'Inactive'}
                    </Typography>
                </Box>
            </Box>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>Personal Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Full Name</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>{auth.user.name}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Email Address</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>{auth.user.email}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Role</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827', textTransform: 'capitalize' }}>
                            {auth.user.user_role || 'N/A'}
                        </Typography>
                    </Box>
                </Box>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>Compensation</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Monthly Salary</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                            {auth.user.salary
                                ? Number(auth.user.salary).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
                                : 'N/A'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Payment Status</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ height: 8, width: 8, borderRadius: '50%', bgcolor: salary[0]?.status === 'paid' ? '#14B8A6' : '#F59E0B' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: salary[0]?.status === 'paid' ? '#0F766E' : '#B45309' }}>
                                {salary[0]?.status === 'paid' ? 'Paid' : 'Pending'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 4 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {salary[0]?.status === 'paid' ? (
                        <Button
                            onClick={() => handleDownloadPdf({ user: auth.user.name, amount: auth.user.salary || 0, status: 'paid', date: new Date() })}
                            variant="contained"
                            color="primary"
                            sx={{
                                py: 1.5,
                                textTransform: 'capitalize',
                                '&:hover': { bgcolor: '#4338CA' }
                            }}
                        >
                            Download Payslip
                        </Button>
                    ) : (
                        <Box sx={{ p: 2, borderRadius: '6px', bgcolor: '#FEFCE8', border: 1, borderColor: '#FEF08A', textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#B45309' }}>
                                ⚠️ Your salary status is pending. We'll notify you once updated.
                            </Typography>
                        </Box>
                    )}
                    <Button
                        onClick={() => window.location.href = '/manage-leaves'}
                        variant="outlined"
                        sx={{
                            py: 1.5,
                            textTransform: 'capitalize',
                            borderColor: '#D1D5DB',
                            color: '#374151',
                            '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                        }}
                    >
                        Request Time Off
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/profile'}
                        variant="outlined"
                        sx={{
                            py: 1.5,
                            textTransform: 'capitalize',
                            borderColor: '#D1D5DB',
                            color: '#374151',
                            '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                        }}
                    >
                        Update Employee Profile
                    </Button>
                </Box>
            </div>
        </div>
        <PerformanceChart performanceData={performanceData} sectionLoading={sectionLoading} title="Your Performance" />
    </div>
);

export default function Dashboard({ auth, authUserRole }) {
    const [users, setUsers] = useState([]);
    const [leaveData, setLeaveData] = useState({ pending: 0, accepted: 0, requested: 0, upcoming: [] });
    const [payroll, setPayroll] = useState('N/A');
    const [loading, setLoading] = useState(true);
    const [sectionLoading, setSectionLoading] = useState({ leaves: false, charts: false });
    const [salary, setSalaries] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [filterType, setFilterType] = useState('month');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Get current month (1-12)
    const currentYear = currentDate.getFullYear();
    const [selectedDate, setSelectedDate] = useState(new Date(currentYear, currentMonth - 1, 1)); // Default to 1st of current month
    const [selectedMonth, setSelectedMonth] = useState(currentMonth); // Default to current month
    const [selectedYear, setSelectedYear] = useState(currentYear); // Default to current year
    const [count, setCount] = useState(0);
    const [error, setError] = useState(null);

    const isAuthorized = authUserRole === 'admin' || authUserRole === 'hr';

    const pendingLeave = useCallback(() => {
        axios
            .get('/admin/pending-leave')
            .then((response) => setCount(response.data))
            .catch((error) => console.error('Error fetching pending leaves:', error));
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setSectionLoading((prev) => ({ ...prev, leaves: true }));
            setError(null);
            const params = { year: selectedYear, month: filterType === 'month' ? selectedMonth : 0 };
            const [userRes, leaveRes] = await Promise.all([
                axios.get('/list', { params }),
                axios.get('/leaves', { params })
            ]);

            const userList = Array.isArray(userRes.data) ? userRes.data : [];
            const leaveList = Array.isArray(leaveRes.data) ? leaveRes.data : [];

            setUsers(userList);

            const filteredLeaves = leaveList.filter((leave) => {
                const leaveDate = new Date(leave.start_date);
                if (isNaN(leaveDate.getTime())) return false;
                if (filterType === 'year') {
                    return leaveDate.getFullYear() === selectedYear;
                } else if (filterType === 'month') {
                    return leaveDate.getFullYear() === selectedYear && leaveDate.getMonth() + 1 === selectedMonth;
                } else if (filterType === 'week') {
                    const weekStart = new Date(selectedDate);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return leaveDate >= weekStart && leaveDate <= weekEnd && leaveDate.getFullYear() === selectedYear;
                } else {
                    return leaveDate.toDateString() === selectedDate.toDateString() && leaveDate.getFullYear() === selectedYear;
                }
            });

            const pending = filteredLeaves.filter((l) => l.status === 'pending').length;
            const accepted = filteredLeaves.filter((l) => l.status === 'accepted' || l.status === 'approved').length;
            const requested = filterType === 'month' || filterType === 'year' ? pending + accepted : filteredLeaves.length;
            const upcoming = leaveList
                .filter((l) => {
                    const leaveDate = new Date(l.start_date);
                    const now = new Date();
                    if (isNaN(leaveDate.getTime()) || leaveDate <= now) return false;
                    if (filterType === 'year') {
                        return leaveDate.getFullYear() === selectedYear;
                    } else if (filterType === 'month') {
                        return leaveDate.getFullYear() === selectedYear && leaveDate.getMonth() + 1 === selectedMonth;
                    } else if (filterType === 'week') {
                        const weekStart = new Date(selectedDate);
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        return leaveDate >= weekStart && leaveDate <= weekEnd && leaveDate.getFullYear() === selectedYear;
                    } else {
                        return leaveDate.toDateString() === selectedDate.toDateString() && leaveDate.getFullYear() === selectedYear;
                    }
                })
                .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

            setLeaveData({ pending, accepted, requested, upcoming });

            const totalPayroll = userList.reduce((sum, user) => sum + Number(user.salary || 0), 0);
            setPayroll(
                !isFinite(totalPayroll) || totalPayroll <= 0
                    ? 'N/A'
                    : totalPayroll.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
            );
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
            setSectionLoading((prev) => ({ ...prev, leaves: false }));
        }
    }, [filterType, selectedDate, selectedMonth, selectedYear]);

    useEffect(() => {
        if (isAuthorized) {
            fetchData();
            pendingLeave();
        } else {
            setLoading(false);
        }
    }, [isAuthorized, filterType, selectedDate, selectedMonth, selectedYear, fetchData, pendingLeave]);

    useEffect(() => {
        axios
            .get('/salary-status', { params: { month: filterType === 'month' ? selectedMonth : 0, year: selectedYear } })
            .then((response) => setSalaries(response.data))
            .catch((response) => {
                console.error('Error fetching salary status:', error);
            })
            .finally(() => setLoading(false));
    }, [filterType, selectedMonth, selectedYear]);

    const fetchPerformance = useCallback(() => {
        const cacheKey = `performance_${filterType}-${selectedMonth}_${selectedYear}`;
        if (cache.has(cacheKey)) {
            setPerformanceData(cache.get(cacheKey));
            setSectionLoading((prev) => ({ ...prev, charts: false }));
            return;
        }

        setSectionLoading((prev) => ({ ...prev, charts: true }));
        axios
            .get('/admin/performance', { params: { month: filterType === 'month' ? selectedMonth : 0, year: selectedYear } })
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                setPerformanceData(data);
                cache.set(cacheKey, data);
            })
            .catch((error) => {
                console.error('Error fetching performance data:', error);
                setPerformanceData([]);
            })
            .finally(() => setSectionLoading((prev) => ({ ...prev, charts: false })));

    }, [filterType, selectedMonth, selectedYear]);

    const debouncedFetchPerformance = useCallback(debounce(fetchPerformance, 300), [fetchPerformance]);

    useEffect(() => {
        if (isAuthorized) {
            debouncedFetchPerformance();
        }
    }, [isAuthorized, filterType, selectedMonth, selectedYear, debouncedFetchPerformance]);

    const getCardTitle = (baseTitle) => {
        if (filterType === 'year') {
            return `${baseTitle} (${selectedYear})`;
        } else if (filterType === 'month') {
            return `${baseTitle} (${months[selectedMonth - 1]} ${selectedYear})`;
        } else if (filterType === 'week') {
            const weekStart = new Date(selectedDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            return `${baseTitle} (Week, ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${selectedYear})`;
        } else {
            return `${baseTitle} (${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${selectedYear})`;
        }
    };

    if (error) {
        return (
            <AuthenticatedLayout count={count}>
                <Head title="Dashboard" />
                <div className="py-12 bg-gray-50 min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Box sx={{ p: 4, bgcolor: '#FEE2E2', border: 1, borderColor: '#FECACA', borderRadius: '6px' }}>
                            <Typography variant="body1" sx={{ color: '#B91C1C', fontWeight: 500 }}>
                                <strong>Error:</strong> {error}
                            </Typography>
                        </Box>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    useEffect(() => {
        axios.get('/performance/user')
            .then((res) => setPerformanceData(res.data))
            .catch((error) => console.log(error))
    }, []);

    return (
        <AuthenticatedLayout count={count}>
            <Head title="Dashboard" />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm-px-6 lg:px-8 space-y-8">
                    {loading ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: '12px' }} />
                                ))}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '12px' }} />
                                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '12px' }} />
                            </div>
                        </div>
                    ) : isAuthorized ? (
                        <>
                            <DateFilter
                                filterType={filterType}
                                setFilterType={setFilterType}
                                selectedMonth={selectedMonth}
                                setSelectedMonth={setSelectedMonth}
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                selectedYear={selectedYear}
                                setSelectedYear={setSelectedYear}
                                sectionLoading={sectionLoading}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <DashboardCard
                                    label={getCardTitle("Total Employees")}
                                    value={users.length}
                                    trend="up"
                                    trendValue="12%"
                                    filterType={filterType}
                                />
                                <DashboardCard
                                    label={getCardTitle("Requested Leaves")}
                                    value={leaveData.requested}
                                    trend="down"
                                    trendValue="5%"
                                    filterType={filterType}
                                />
                                <DashboardCard
                                    label={getCardTitle("Monthly Payrolls")}
                                    value={payroll}
                                    trend="up"
                                    trendValue="18%"
                                    filterType={filterType}
                                />
                                <DashboardCard
                                    label={getCardTitle("Pending Leaves")}
                                    value={leaveData.pending}
                                    trend="neutral"
                                    filterType={filterType}
                                />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <LeaveStatusChart leaveData={leaveData} sectionLoading={sectionLoading} />
                                <UpcomingLeavesTable
                                    leaveData={leaveData}
                                    users={users}
                                    sectionLoading={sectionLoading}
                                    filterType={filterType}
                                    selectedDate={selectedDate}
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                />
                            </div>
                            <PerformanceChart
                                performanceData={performanceData}
                                sectionLoading={sectionLoading}
                                title={getCardTitle("Team Performance Trend")}
                            />
                        </>
                    ) : (
                        <EmployeeDashboard
                            auth={auth}
                            salary={salary}
                            performanceData={performanceData}
                            sectionLoading={sectionLoading}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
