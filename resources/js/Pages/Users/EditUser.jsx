import React from 'react';
import { useForm } from '@inertiajs/react';

export default function EditUserModal({ user, onClose, onUpdated }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        user_role: user?.user_role || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                onUpdated();
                onClose();
            },
        });
    };


    if (!user) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={onClose} // Clicking backdrop
        >
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-lg font-bold mb-4">Edit User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                        {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                        {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={data.user_role}
                            onChange={(e) => setData('user_role', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                            <option value="employee">Employee</option>
                            <option value="hr">HR</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors.user_role && <div className="text-red-600 text-sm">{errors.user_role}</div>}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
