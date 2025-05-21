// resources/js/Layouts/AuthenticatedLayout.jsx
import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsList from '@/Pages/Users/Notification';
import ChatBot from '../Pages/ChatBot'; 
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
   useEffect(()=>{
     inquiryData()
   },[])
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
    const inquiryData=()=>{
        axios.get('/admin/employee-inquiry')
        .then((res)=>{
           setInquiry(res.data);
           setRead(res.data.length > 0);
        })
        .catch((error) => {
            console.error('Failed to fetch inquiry details:', error);
        })
    }

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
                                        {(user?.user_role === 'hr' && count > 0) && (
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

                                {/* ✅ Chat Bot toggle button */}
                                {/* <button
                                    type="button"
                                    onClick={() => setShowChatBot(true)}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    Chat Bot
                                </button> */}
                            </div>
                        </div>

                        <div className="relative hidden sm:ms-6 sm:flex sm:items-center gap-4">
                            <div>
                                {(user.user_role !== 'admin' && user.user_role !== 'hr') ? (
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
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
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
        </div>
    );
}
