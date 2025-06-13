import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Avatar, Box, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsList from '@/Pages/Users/Notification';
import axios from 'axios';

export default function AuthenticatedLayout({ header, count, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [notifications, setNotifications] = useState([]);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [read, setRead] = useState(false);
    const [inquiry, setInquiry] = useState([]);
    const [showChatBot, setShowChatBot] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setHasUnread(false);
        setRead(false);
    };

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    useEffect(() => {
        inquiryData();
    }, []);

    useEffect(() => {
        if (user?.id) {
            axios
                .get(`/notification/${user.id}`)
                .then((res) => {
                    setNotifications(res.data);
                    setHasUnread(res.data.length > 0);
                })
                .catch((error) => {
                    console.error('Failed to fetch notifications:', error);
                });
        }
    }, [user?.id]);

    const inquiryData = () => {
        axios
            .get('/admin/employee-inquiry')
            .then((res) => {
                setInquiry(res.data);
                setRead(res.data.length > 0);
            })
            .catch((error) => {
                console.error('Failed to fetch inquiry details:', error);
            });
    };

    const getInitials = (name) => {
        if (!name) return '';
        const nameParts = name.trim().split(' ');
        return nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : nameParts[0][0].toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar - Hidden on mobile (sm and below) */}
            <div className={`hidden sm:block fixed left-0 top-0 h-full bg-white text-gray-900 transition-all duration-300 ease-in-out z-40 ${
                sidebarExpanded ? 'w-55' : 'w-16'
            }`}>
                {/* Sidebar Header with Logo */}
                {/* <div className="flex items-center p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <ApplicationLogo className="block h-9 w-auto fill-current text-white" />
                        </div>
                        {sidebarExpanded && (
                            <span className="text-xl font-semibold text-white">Wepro</span>
                        )}
                    </div>
                </div> */}

                {/* Navigation Items */}
                <nav className="flex-1 p-4 border-r-2 border-gray-200">
                    <ul className="space-y-2">
                        <li>
                            <Link
                                href={route('dashboard')}
                                className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                                    route().current('dashboard')
                                        ? 'bg-slate-700 text-white'
                                        : 'text-gray-900 hover:bg-slate-700 hover:text-white'
                                } ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}
                            >
                                <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                                </svg>
                                {sidebarExpanded && <span>Dashboard</span>}
                            </Link>
                        </li>

                        {(user.user_role === 'hr' || user.user_role === 'admin') && (
                            <li>
                                <Link
                                    href={route('manage-users')}
                                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                                        route().current('manage-users')
                                            ? 'bg-slate-700 text-white'
                                            : 'text-gray-900 hover:bg-slate-700 hover:text-white'
                                    } ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}
                                >
                                    <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 14c2.21 0 4 1.79 4 4v2H4v-2c0-2.21 1.79-4 4-4h8zm-4-2a4 4 0 100-8 4 4 0 000 8z" />
                                    </svg>
                                    {sidebarExpanded && <span>Employees</span>}
                                </Link>
                            </li>
                        )}

                        <li>
                            <Link
                                href={route('manage-salaries')}
                                className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                                    route().current('manage-salaries')
                                        ? 'bg-slate-700 text-white'
                                        : 'text-gray-900 hover:bg-slate-700 hover:text-white'
                                } ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}
                            >
                                <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m0-8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-12v2m0 10v2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {sidebarExpanded && <span>Salaries</span>}
                            </Link>
                        </li>

                        <li>
                            <Link
                                href={route('manage-leaves')}
                                className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                                    route().current('manage-leaves')
                                        ? 'bg-slate-700 text-white'
                                        : 'text-gray-900 hover:bg-slate-700 hover:text-white'
                                } ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}
                            >
                                <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {sidebarExpanded && (
                                    <div className="flex items-center justify-between w-full">
                                        <span>Leaves</span>
                                        {user?.user_role === 'hr' && count > 0 && (
                                            <span
                                                style={{
                                                    backgroundColor: 'green',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    padding: '2px 6px',
                                                    fontSize: '12px',
                                                    lineHeight: '1',
                                                }}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        </li>

                        {(user?.user_role === 'hr' || user?.user_role === 'admin') && (
                            <li>
                                <Link
                                    href={route('performances.index')}
                                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                                        route().current('performances.index')
                                            ? 'bg-slate-700 text-white'
                                            : 'text-gray-900 hover:bg-slate-700 hover:text-white'
                                    } ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}
                                >
                                    <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    {sidebarExpanded && <span>Performance</span>}
                                </Link>
                            </li>
                        )}

                        <li>
                            <Link
                                href={route('policies.index')}
                                className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                                    route().current('policies.index')
                                        ? 'bg-slate-700 text-white'
                                        : 'text-gray-900 hover:bg-slate-700 hover:text-white'
                                } ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}
                            >
                                <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {sidebarExpanded && <span>Company Policies</span>}
                            </Link>
                        </li>

                        <li>
                            <Link
                                href={route('settings')}
                                className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                                    route().current('settings')
                                        ? 'bg-slate-700 text-white'
                                        : 'text-gray-900 hover:bg-slate-700 hover:text-white'
                                } ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}
                            >
                                <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {sidebarExpanded && <span>Settings</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Toggle Button - Only visible on desktop */}
                <div className="absolute -right-3 top-6 z-50">
                    <button
                        onClick={toggleSidebar}
                        className="h-6 w-6 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white"
                    >
                        {sidebarExpanded ? (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area - Responsive margin */}
            <div className={`transition-all duration-300 ease-in-out ${
                sidebarExpanded ? 'sm:ml-64' : 'sm:ml-16'
            } ml-0`}>
                {/* Top Navigation Bar */}
                <nav className="border-b border-gray-100 bg-white">
                    <div className="mx-auto px-2 sm:px-4 lg:px-6">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                    </Link>
                                </div>
                            </div>

                            {/* Right side - Notifications and User (Desktop) */}
                            <div className="relative hidden sm:ms-6 sm:flex sm:items-center gap-4">
                                <div>
                                    {user.user_role !== 'admin' && user.user_role !== 'hr' ? (
                                        <>
                                            <Badge badgeContent={hasUnread ? notifications.length : 0} color="error">
                                                <button
                                                    type="button"
                                                    className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
                                                    onClick={toggleNotifications}
                                                >
                                                    <NotificationsIcon />
                                                </button>
                                            </Badge>
                                            {showNotifications && (
                                                <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-center">
                                                    <div onClick={() => setShowNotifications(false)} className="absolute inset-0" />
                                                    <NotificationsList
                                                        notifications={notifications}
                                                        onClose={toggleNotifications}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Badge badgeContent={read ? inquiry.length : 0} color="error">
                                                <button
                                                    type="button"
                                                    className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
                                                    onClick={toggleNotifications}
                                                >
                                                    <NotificationsIcon />
                                                </button>
                                            </Badge>
                                            {showNotifications && (
                                                <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-center">
                                                    <div onClick={() => setShowNotifications(false)} className="absolute inset-0" />
                                                    <NotificationsList
                                                        notifications={inquiry}
                                                        onClose={toggleNotifications}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                >
                                                    <Avatar
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            bgcolor: '#CCFBF1',
                                                            color: '#0D9488',
                                                            fontSize: '14px',
                                                            mr: 1,
                                                        }}
                                                    >
                                                        {!user.avatar && getInitials(user.name)}
                                                    </Avatar>
                                                    {user.name}
                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            {/* Mobile menu button - Only visible on mobile */}
                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Dropdown - Only visible on mobile with white background and dark text */}
                    <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-white'}>
                        <div className="space-y-1 pb-3 pt-2 px-2">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                                className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                            >
                                Dashboard
                            </ResponsiveNavLink>
                            {(user.user_role === 'hr' || user.user_role === 'admin') && (
                                <ResponsiveNavLink
                                    href={route('manage-users')}
                                    active={route().current('manage-users')}
                                    className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                                >
                                    Employees
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink
                                href={route('manage-salaries')}
                                active={route().current('manage-salaries')}
                                className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                            >
                                Salaries
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('manage-leaves')}
                                active={route().current('manage-leaves')}
                                className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                            >
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <span>Leaves</span>
                                    {user?.user_role === 'hr' && count > 0 && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-12px',
                                                backgroundColor: 'green',
                                                color: 'white',
                                                borderRadius: '50%',
                                                padding: '2px 6px',
                                                fontSize: '12px',
                                                lineHeight: '1',
                                            }}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </div>
                            </ResponsiveNavLink>
                            {(user?.user_role === 'hr' || user.user_role === 'admin') && (
                                <ResponsiveNavLink
                                    href={route('performances.index')}
                                    active={route().current('performances.index')}
                                    className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                                >
                                    Performance
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink
                                href={route('policies.index')}
                                active={route().current('policies.index')}
                                className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                            >
                                Company Policies
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('settings')}
                                active={route().current('settings')}
                                className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                            >
                                Settings
                            </ResponsiveNavLink>
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4 bg-white">
                            <div className="px-4 flex items-center">
                                <Avatar
                                    src={user.avatar}
                                    alt={user.name}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: '#CCFBF1',
                                        color: '#0D9488',
                                        fontSize: '16px',
                                        mr: 2,
                                    }}
                                >
                                    {!user.avatar && getInitials(user.name)}
                                </Avatar>
                                <Box>
                                    <div className="text-base font-medium text-gray-800 capitalize">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                </Box>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                <ResponsiveNavLink
                                    href={route('profile.edit')}
                                    className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                                >
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition duration-150 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Header */}
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto px-2 sm:px-4 lg:px-6 py-6">{header}</div>
                    </header>
                )}

                {/* Main Content */}
                <main className="p-2 sm:p-4">{children}</main>
            </div>

            {/* {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
            <button
                onClick={() => setShowChatBot(true)}
                className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition"
            >
                <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                </svg>
            </button> */}
        </div>
    );
}

