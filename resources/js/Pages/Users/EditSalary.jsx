// EditSalaryModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
} from '@mui/material';

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
        name: salary.name || '',
        amount: salary.amount || '',
        date: salary.date || '',
        status: salary.status || '',
      });
    }
  }, [salary]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = ['Name is required'];
    if (!form.amount.trim()) newErrors.amount = ['Amount is required'];
    if (!form.date) newErrors.date = ['Date is required'];
    if (!form.status) newErrors.status = ['Status is required'];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    axios
      .put(`/salaries/${salary.id}`, form)
      .then((response) => {
        onSalaryUpdated(response.data);
        onClose();
      })
      .catch((error) => {
        console.error('Error updating salary:', error);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Salary</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.[0]}
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
            helperText={errors.amount?.[0]}
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
            helperText={errors.date?.[0]}
          />

          <FormControl
            fullWidth
            margin="normal"
            error={!!errors.status}
          >
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={form.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="">
                <em>Select Status</em>
              </MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
            {errors.status && <FormHelperText>{errors.status[0]}</FormHelperText>}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
