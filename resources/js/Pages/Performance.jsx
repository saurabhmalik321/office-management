import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function Performance() {
  const { performances, flash, errors } = usePage().props;
  const [showDate, setShowDate] = useState(false);
  const [form, setForm] = useState({
    user_id: '',
    category: '',
    score: '',
    remarks: '',
    evaluated_at: '',
  });

  const categoryOptions = [
    { value: 'Communication', label: 'Communication' },
    { value: 'Teamwork', label: 'Teamwork' },
    { value: 'Problem Solving', label: 'Problem Solving' },
    { value: 'Attendance', label: 'Attendance' },
    { value: 'Productivity', label: 'Productivity' },
  ];

  const [count, setCount] = useState(0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 console.log(performances,"performnace")
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
      },
    });
    setShowDate(false);
  };

  const pendingLeave = () => {
    axios
      .get('/admin/pending-leave')
      .then((response) => setCount(response.data))
      .catch((error) => console.error('Error fetching leaves:', error));
  };

  useEffect(() => {
    pendingLeave();
  }, []);

  // DataGrid columns setup
  const columns = [
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
       renderCell: (params) => {
         return params.row.user || '';
       },
      sortable: true,
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      sortable: true,
    },
    {
      field: 'score',
      headerName: 'Score',
      type: 'number',
      flex: 0.7,
      sortable: true,
    },
    {
      field: 'evaluated_at',
      headerName: 'Date',
      flex: 1,
      sortable: true,
    },
    {
      field: 'remarks',
      headerName: 'Remarks',
      flex: 1.5,
      sortable: true,
    },
  ];

  // Map performances to DataGrid rows, adding a unique id per row
  const rows = performances.map((perf, index) => ({
    id: index,
    user: perf.user.name,
    category: perf.category,
    score: perf.score,
    evaluated_at: perf.evaluated_at,
    remarks: perf.remarks,
  }));
  return (
    <AuthenticatedLayout
      header={<Typography variant="h5">Performance </Typography>}
      count={count}
    >
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Employee Performance
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="User ID"
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            margin="normal"
            error={!!errors.user_id}
            helperText={errors.user_id}
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
            select
            fullWidth
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            margin="normal"
            error={!!errors.category}
            helperText={errors.category}
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
            sx={{
              backgroundColor: 'background.paper',
            }}
          >
            <MenuItem value="" disabled>
              Select Category
            </MenuItem>
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Score (1-10)"
            name="score"
            value={form.score}
            onChange={handleChange}
            margin="normal"
            error={!!errors.score}
            helperText={errors.score}
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
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            margin="normal"
            error={!!errors.remarks}
            helperText={errors.remarks}
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
            type={showDate ? 'date' : 'text'}
            label="Evaluation Date"
            name="evaluated_at"
            value={form.evaluated_at}
            onChange={handleChange}
            onFocus={() => setShowDate(true)}
            onBlur={(e) => {
              if (!e.target.value) setShowDate(false);
            }}
            margin="normal"
            error={!!errors.evaluated_at}
            helperText={errors.evaluated_at}
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
            sx={{
              backgroundColor: 'background.paper',
            }}
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{
              textTransform: 'capitalize',
              mt: 2,
              width: '200px',
              height: '50px',
              display: 'block',
              mx: 'left',
            }}
          >
            Add Performance
          </Button>
        </Box>

        {/* Uncomment to show flash message
        {flash.message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {flash.message}
          </Alert>
        )} */}

        {/* MUI DataGrid with sorting and pagination */}
        <Paper elevation={3} sx={{ mt: 3, borderRadius: 2, padding: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}
          />
        </Paper>
      </Container>
    </AuthenticatedLayout>
  );
}
