import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SendNotification({ onSent,employees }) {
    const [form, setForm] = useState({
        employee_id: '',
        title: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    // const [employees, setEmployees] = useState([]);

    // useEffect(() => {
    //     axios.get('/list') // or your endpoint for listing employees
    //         .then(response => setEmployees(response.data))
    //         .catch(error => console.error('Error loading employees:', error));
    // }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        axios.post('/notifications', form)
            .then(() => {
                alert('Notification sent!');
                setForm({ employee_id: '', title: '', message: '' });
                if (onSent) onSent();
            })
            .catch(error => {
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    console.error(error);
                }
            });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
            <div>
                <label className="block font-semibold">Send To</label>
                <select name="employee_id" value={form.employee_id} onChange={handleChange} className="w-full border px-3 py-2">
                    <option value="">Select Employee</option>
                    {employees?.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
                {errors.employee_id && <div className="text-red-500 text-sm">{errors.employee_id[0]}</div>}
            </div>

            <div>
                <label className="block font-semibold">Title</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border px-3 py-2" />
                {errors.title && <div className="text-red-500 text-sm">{errors.title[0]}</div>}
            </div>

            <div>
                <label className="block font-semibold">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} className="w-full border px-3 py-2" />
                {errors.message && <div className="text-red-500 text-sm">{errors.message[0]}</div>}
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
        </form>
    );
}
