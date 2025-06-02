import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Avatar, Box, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsList from '@/Pages/Users/Notification';
import ChatBot from '@/Pages/ChatBot';
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

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setHasUnread(false);
        setRead(false);
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
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                {(user.user_role === 'hr' || user.user_role === 'admin') && (
                                    <NavLink href={route('manageusers')} active={route().current('manageusers')}>
                                        Users
                                    </NavLink>
                                )}
                                <NavLink href={route('managesalaries')} active={route().current('managesalaries')}>
                                    Salaries
                                </NavLink>
                                <NavLink href={route('manageleaves')} active={route().current('manageleaves')}>
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
                                    </NavLink>
                                      {(user?.user_role === 'hr' || user?.user_role === 'admin') &&
                                             <NavLink
                                                href={route('performances.index')}
                                                active={route().current('performances.index')}
                                            >
                                                Performance
                                    </NavLink> }
                                    <NavLink
                                     href={route('policies.index')}
                                     active={route().current('policies.index')}
                                    >
                                    Company Policies
                                    </NavLink>
                            </div>
                        </div>

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

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        {(user.user_role === 'hr' || user.user_role === 'admin') && (
                            <ResponsiveNavLink href={route('manageusers')} active={route().current('manageusers')}>
                                Users
                            </ResponsiveNavLink>
                        )}
                        <ResponsiveNavLink href={route('managesalaries')} active={route().current('managesalaries')}>
                            Salaries
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('manageleaves')} active={route().current('manageleaves')}>
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
                            >
                                Performance
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
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
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>

            {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
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
            </button>
        </div>
    );
}
