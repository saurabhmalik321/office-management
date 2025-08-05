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
    axios.get('/date/get')
      .then(res => setDate(res.data.date))
      .catch(err => console.error('Error fetching date:', err));
  }, []);

  const handleSave = () => {
    setLoading(true);
    axios.post('/update/date', { date: newDate })
      .then(res => {
        setDate(newDate);
        setEditMode(false);
      })
      .catch(err => console.error('Error updating date:', err))
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setEditMode(false);
    setNewDate(date);
  };
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Settings</h2>}
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
            <Stack spacing={3}>
            <TextField
                label="Date"
                name="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                mt: 1,
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    '& fieldset': {
                    borderColor: '#ccc',
                    },
                    '&:hover fieldset': {
                    borderColor: '#999',
                    boxShadow: '0 0 8px rgba(0,0,0,0.15)',
                    },
                    '&.Mui-focused fieldset': {
                    borderColor: '#666',
                    boxShadow: '0 0 8px rgba(0,0,0,0.25)',
                    },
                },
                '& input': {
                    boxShadow: 'none !important',
                },
                }}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                    textTransform: 'none',
                    px: 3,
                    '&:hover': {
                    backgroundColor: 'rgba(220,0,78,0.08)',
                    borderColor: '#d4004e',
                    },
                }}
                >
                Cancel
                </Button>
                <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                sx={{
                    textTransform: 'none',
                    px: 3,
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                    '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.24)',
                    backgroundColor: '#0059c1',
                    },
                }}
                >
                Save
                </Button>
            </Stack>
            </Stack>

        )}
        </Box>
        </AuthenticatedLayout>
    );
}
