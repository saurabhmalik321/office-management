           import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Settings() {
  const [date, setDate] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the date initially
    // axios.get('/date/get')
    //   .then(res => setDate(res.data.date))
    //   .catch(err => console.error('Error fetching date:', err));
  }, []);

  const handleSave = () => {
    // setLoading(true);
    // axios.post('/update/date', { date: newDate })
    //   .then(res => {
    //     setDate(newDate);
    //     setEditMode(false);
    //   })
    //   .catch(err => console.error('Error updating date:', err))
    //   .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setEditMode(false);
    setNewDate(date);
  };
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Messages</h2>}
        >

        <Box p={3} maxWidth={400} mx="auto">
        {!editMode ? (
            <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Set Date:</Typography>
            <Typography>{date || 'N/A'}</Typography>
            <IconButton onClick={() => {
                setNewDate(date);
                setEditMode(true);
            }}>
                <EditIcon />
            </IconButton>
            </Stack>
        ) : (
            <Stack spacing={2}>
            <TextField
                type="date"
                label="Select Date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
            />
            <Stack direction="row" spacing={2}>
                <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                >
                Save
                </Button>
                <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                disabled={loading}
                >
                Cancel
                </Button>
            </Stack>
            </Stack>
        )}
        </Box>
        </AuthenticatedLayout>
    );
}
