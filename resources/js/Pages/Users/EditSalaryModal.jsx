// EditSalaryModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

export default function EditSalaryModal({ open, onClose, salary, onSalaryUpdated }) {
    const [form, setForm] = useState({
        name: '',
        amount: '',
        date: '',
        status: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (salary) {
            setForm({
                name: salary.name,
                amount: salary.amount,
                date: salary.date,
                status: salary.status,
            });
        }
    }, [salary]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();

        // Client-side validation
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = ['Name is required'];
        if (!form.amount.trim()) newErrors.amount = ['Amount is required'];
        if (!form.date) newErrors.date = ['Date is required'];
        if (!form.status) newErrors.status = ['Status is required'];

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear previous errors and send request to server
        setErrors({});

        axios.put(`/salaries/${salary.id}`, form)
            .then(response => {
                onSalaryUpdated(response.data); // Call parent callback to update the table
                onClose(); // Close the modal
            })
            .catch((error) => {
                console.error('Error updating salary:', error);
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors); // Server-side validation errors
                }
            });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Salary</DialogTitle>
            <DialogContent>
                <TextField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name && errors.name[0]}
                />
                <TextField
                    label="Amount"
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.amount}
                    helperText={errors.amount && errors.amount[0]}
                />
                <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date && errors.date[0]}
                />

                <div className="mb-4">
                <label className="block font-medium">Status</label>
                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border px-3 py-2"
                >
                    <option value="">Select Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                </select>
                {/* {errors.user_role && <div className="text-red-500 text-sm">{errors.user_role[0]}</div>} */}
            </div>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
