import React, { useState } from 'react';
import axios from 'axios';

export default function AddUser({ onUserAdded }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        user_role: '',
        password: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Client-side validation
    if (!form.email.trim()) {
        newErrors.email = ['Email is required'];
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = ['Invalid email format'];
    }

    if (!form.name.trim()) {
        newErrors.name = ['Name is required'];
    }

    if (!form.password.trim()) {
        newErrors.password = ['Password is required'];
    } else if (form.password.length < 6) {
        newErrors.password = ['Password must be at least 6 characters'];
    }

    if (!form.user_role) {
        newErrors.user_role = ['Role is required'];
    }

    // Stop if client-side validation failed
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    // 2. Send request to server
    setErrors({}); // Clear previous errors
    axios.post('/admin/users', form)
        .then(response => {
            onUserAdded(response.data);
            setForm({ name: '', email: '', user_role: '', password: '' });
        })
        .catch(error => {
            if (error.response?.status === 422 && error.response.data.errors) {
                setErrors(error.response.data.errors); // Laravel validation errors
            } else if (error.response?.status === 409) {
                setErrors({ email: ['Email is already in use'] });
            } else {
                console.error('Unexpected error:', error);
            }
        });
};


    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-2">
                <label className="block font-medium">Name</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border px-3 py-2"
                />
                {errors.name && <div className="text-red-500 text-sm">{errors.name[0]}</div>}
            </div>

            <div className="mb-2">
                <label className="block font-medium">Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border px-3 py-2"
                />
                {errors.email && <div className="text-red-500 text-sm">{errors.email[0]}</div>}
            </div>

            <div className="mb-2">
                <label className="block font-medium">Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border px-3 py-2"
                />
                {errors.password && <div className="text-red-500 text-sm">{errors.password[0]}</div>}
            </div>

            <div className="mb-4">
                <label className="block font-medium">Role</label>
                <select
                    name="user_role"
                    value={form.user_role}
                    onChange={handleChange}
                    className="w-full border px-3 py-2"
                >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="hr">HR</option>
                    <option value="employee">Employee</option>
                </select>
                {errors.user_role && <div className="text-red-500 text-sm">{errors.user_role[0]}</div>}
            </div>

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Add User
            </button>
        </form>
    );
}
