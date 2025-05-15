import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get('/list')
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
            });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            axios.delete(`/admin/users/${id}`)
                .then(() => {
                    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
                })
                .catch((error) => {
                    console.error('Error deleting user:', error);
                });
        }
    };

    const handleEdit = (id) => {
        window.location.href = `/admin/users/${id}/edit`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Manage All users
                </h2>
            }
        >
            <Head title="Manage Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-4 text-lg font-medium">Here is a list of current users:</h3>
                            <table className="min-w-full table-auto border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border px-4 py-2">Name</th>
                                        <th className="border px-4 py-2">Email</th>
                                        <th className="border px-4 py-2">Role</th>
                                        <th className="border px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="border px-4 py-2">{user.name}</td>
                                            <td className="border px-4 py-2">{user.email}</td>
                                            <td className="border px-4 py-2">{user.user_role}</td>
                                            <td className="border px-4 py-2 space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user.id)}
                                                    className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="inline-flex items-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
