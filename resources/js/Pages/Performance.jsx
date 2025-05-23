import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function Performance() {
  const theme = useTheme();
  const { performances, flash, errors, } = usePage().props;
  const [showDate, setShowDate] = useState(false);
  const [form, setForm] = useState({
    user_id: '',
    category: '',
    score: '',
    remarks: '',
    evaluated_at: '',
  });
  const [count, setCount] = useState(0);
  const [users,setUsers] = useState([]);

  const categoryOptions = [
    'Communication',
    'Teamwork',
    'Problem Solving',
    'Attendance',
    'Productivity',
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post(route('performances.store'), form, {
      onSuccess: () => {
        setForm({
          user_id: '',
          category: '',
          score: '',
          remarks: '',
          evaluated_at: '',
        });
        setShowDate(false);
      },
    });
  };
    const fetchUsers = () => {
      axios.get('/employee')
        .then((response) => setUsers(response.data))
        .catch((error) => {
          console.error('Error fetching users:', error);
          showNotification('error', 'Failed to load users.');
        });
    };

  const pendingLeave = () => {
    axios
      .get('/admin/pending-leave')
      .then((response) => setCount(response.data))
      .catch((error) => console.error('Error fetching leaves:', error));
  };

  useEffect(() => {
    pendingLeave();
    fetchUsers();
  }, []);

  const columns = [
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      renderCell: (params) => params.row.user || '',
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" variant="outlined" size="small" />
      ),
    },
    {
      field: 'score',
      headerName: 'Score',
      flex: 0.5,
      renderCell: ({ value }) => (
        <Typography color={value >= 8 ? 'green' : value >= 5 ? 'orange' : 'red'}>
          {value}
        </Typography>
      ),
    },
    { field: 'evaluated_at', headerName: 'Date', flex: 1 },
    { field: 'remarks', headerName: 'Remarks', flex: 2 },
  ];

  const rows = performances.map((perf, index) => ({
    id: index,
    user: perf.user.name,
    category: perf.category,
    score: perf.score,
    evaluated_at: perf.evaluated_at,
    remarks: perf.remarks,
  }));

  return (
    <AuthenticatedLayout header={<Typography variant="h5">Employee Performance</Typography>} count={count}>
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Card elevation={4} sx={{ borderRadius: 4, backgroundColor: '#fafafa' }}>
          <CardHeader title="Add Performance Review" sx={{ backgroundColor: '#f3f4f6' }} />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField select fullWidth label="Employee" name="user_id" value={form.user_id} onChange={handleChange} error={!!errors.user_id} helperText={errors.user_id}>
                <MenuItem value="" disabled>
                  Employee Name
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                ))}
              </TextField>

              <TextField select fullWidth label="Category" name="category" value={form.category} onChange={handleChange} error={!!errors.category} helperText={errors.category}>
                <MenuItem value="" disabled>
                  Select Category
                </MenuItem>
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>

             <TextField
                fullWidth
                select
                label="Performance Rating"
                name="score"
                value={form.score}
                onChange={handleChange}
                error={!!errors.score}
                helperText={errors.score}
                sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#ccc' },
                    '&:hover fieldset': { borderColor: '#bbb' },
                    '&.Mui-focused fieldset': { borderColor: '#ccc' },
                    },
                    backgroundColor: 'background.paper'
                }}
                InputLabelProps={{
                    sx: {
                    color: '#666',
                    '&.Mui-focused': { color: '#666' },
                    },
                }}
                >
                <MenuItem value="" disabled>
                    Select Rating
                </MenuItem>
                {[...Array(10)].map((_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                    </MenuItem>
                ))}
              </TextField>
    
              <TextField fullWidth type={showDate ? 'date' : 'text'} label="Evaluation Date" name="evaluated_at" value={form.evaluated_at} onChange={handleChange} onFocus={() => setShowDate(true)} onBlur={(e) => { if (!e.target.value) setShowDate(false); }} error={!!errors.evaluated_at} helperText={errors.evaluated_at}
               InputProps={{
              sx: {
                borderRadius: 2,
                '&.MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ccc' },
                  '&:hover fieldset': { borderColor: '#bbb' },
                  '&.Mui-focused fieldset': { borderColor: '#ccc' },
                },
                '& input': { boxShadow: 'none !important' },
              },
            }}
            InputLabelProps={{
              sx: {
                color: '#666',
                '&.Mui-focused': { color: '#666' },
              },
            }}
            sx={{ backgroundColor: 'background.paper' }}
              />
             <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                error={!!errors.remarks}
                helperText={errors.remarks}
                sx={{
                    gridColumn: '1 / -1',
                    backgroundColor: 'background.paper',
                    '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                        borderColor: '#ccc',
                    },
                    '&:hover fieldset': {
                        borderColor: '#bbb',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#ccc',
                    },
                    '& textarea': {
                        outline: 'none !important',
                        boxShadow: 'none !important',
                    },
                    },
                }}
                InputLabelProps={{
                    sx: {
                    color: '#666',
                    '&.Mui-focused': { color: '#666' },
                    },
                }}
                />

              <Box sx={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                <Button variant="contained" type="submit" sx={{ px: 4, py: 1, borderRadius: 2 }}>
                  Submit
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ borderRadius: 3, mt: 5 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Employee Performance List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.grey[100],
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            />
          </CardContent>
        </Card>
      </Container>
    </AuthenticatedLayout>
  );
}
