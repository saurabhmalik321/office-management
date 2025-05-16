import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';

export default function SendNotification({ onSent, employees }) {
  const [form, setForm] = useState({
    employee_id: '',
    title: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // success | error
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    axios
      .post('/notifications', form) // <-- correct your actual endpoint here
      .then((res) => {
        if(res.status == '200'){
            setSnackbar({
                open: true,
                message: 'Notification sent successfully!',
                severity: 'success',
            });
        }
        // console.log(snackbar,"succesfsdersdfs")
        setForm({ employee_id: '', title: '', message: '' });

        if (onSent) onSent();

        // Auto-close success message after 2 seconds
        // setTimeout(() => {
        //   setSnackbar((prev) => ({ ...prev, open: false }));
        // }, 2000);
      })
      .catch((error) => {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to send notification.',
            severity: 'error',
          });
        }
      });
  };
  console.log(snackbar,"snackbar");

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          maxWidth: 400,
          mx: 'auto',
          '& .MuiTextField-root': {
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: 'inherit',
                boxShadow: 'none',
              },
            },
          },
          '& label.Mui-focused': {
            color: 'inherit',
          },
        }}
        noValidate
        autoComplete="off"
      >
        <Typography variant="h6" mb={2} fontWeight="bold" textAlign="center">
          Send Notification
        </Typography>

        <TextField
          select
          label="Send To"
          name="employee_id"
          value={form.employee_id}
          onChange={handleChange}
          fullWidth
          error={!!errors.employee_id}
          helperText={errors.employee_id?.[0] || ''}
          size="small"
        >
          <MenuItem value="">Select Employee</MenuItem>
          {employees?.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          error={!!errors.title}
          helperText={errors.title?.[0] || ''}
          size="small"
        />

        <TextField
          label="Message"
          name="message"
          value={form.message}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          error={!!errors.message}
          helperText={errors.message?.[0] || ''}
          size="small"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 1, bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}
        >
          Send
        </Button>
      </Box>

      {/* Success or Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
