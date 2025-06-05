import React, { useState } from 'react';
import axios from 'axios';

export default function AddUser({ onUserAdded }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        user_role: '',
        password: '',
        salary:'',
        joining_date:'',
        current_address:'',
        permanent_address:'',
        phone:'',
        alternate_phone:''
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
    if (!form.salary) {
        newErrors.salary = ['Salary is required'];
    }
    if (!form.password.trim()) {
        newErrors.password = ['Password is required'];
    } else if (form.password.length < 6) {
        newErrors.password = ['Password must be at least 6 characters'];
    }

    if (!form.user_role) {
        newErrors.user_role = ['Role is required'];
    }
      if (!form.joining_date) {
        newErrors.joining_date = ['Joining date is required'];
    }
      if (!form.current_address) {
        newErrors.current_address = ['Current address is required'];
    }
      if (!form.permanent_address) {
        newErrors.permanent_address = ['Permanent address is required'];
    }
      if (!form.phone) {
        newErrors.phone = ['Phone is required'];
    }
      if (!form.alternate_phone) {
        newErrors.alternate_phone = ['Alternate phone is required'];
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
            setForm({ name: '', email: '', user_role: '', password: '',salary:'', joining_date:'',
                    current_address:'',
                    permanent_address:'',
                    phone:'',
                    alternate_phone:''
     });
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
       <div className="max-h-screen overflow-y-auto px-4 py-6">
  <form onSubmit={handleSubmit} className="mb-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Name */}
      <div>
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

      {/* Email */}
      <div>
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

      {/* Password */}
      <div>
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

      {/* Salary */}
      <div>
        <label className="block font-medium">Salary</label>
        <input
          type="number"
          name="salary"
          value={form.salary}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
        {errors.salary && <div className="text-red-500 text-sm">{errors.salary[0]}</div>}
      </div>

      {/* Joining Date */}
      <div>
        <label className="block font-medium">Joining Date</label>
        <input
          type="date"
          name="joining_date"
          value={form.joining_date}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
        {errors.joining_date && <div className="text-red-500 text-sm">{errors.joining_date[0]}</div>}
      </div>

      {/* Phone */}
      <div>
        <label className="block font-medium">Phone</label>
        <input
          type="number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
        {errors.phone && <div className="text-red-500 text-sm">{errors.phone[0]}</div>}
      </div>

      {/* Alternate Phone */}
      <div>
        <label className="block font-medium">Alternate Phone</label>
        <input
          type="number"
          name="alternate_phone"
          value={form.alternate_phone}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
        {errors.alternate_phone && <div className="text-red-500 text-sm">{errors.alternate_phone[0]}</div>}
      </div>

      {/* Role */}
      <div>
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
    </div>

    {/* Addresses (spanning full width) */}
    <div className="mt-4">
      <label className="block font-medium">Current Address</label>
      <input
        type="text"
        name="current_address"
        value={form.current_address}
        onChange={handleChange}
        className="w-full border px-3 py-2"
      />
      {errors.current_address && <div className="text-red-500 text-sm">{errors.current_address[0]}</div>}
    </div>

    <div className="mt-4">
      <label className="block font-medium">Permanent Address</label>
      <input
        type="text"
        name="permanent_address"
        value={form.permanent_address}
        onChange={handleChange}
        className="w-full border px-3 py-2"
      />
      {errors.permanent_address && <div className="text-red-500 text-sm">{errors.permanent_address[0]}</div>}
    </div>

    <button
      type="submit"
      className="mt-6 bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700"
    >
      Add Employee
    </button>
  </form>
</div>
    );
}
