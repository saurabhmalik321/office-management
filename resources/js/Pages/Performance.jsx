import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
//   Container,
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

export default function Performance() {
  const theme = useTheme();
  const { performances, flash, errors } = usePage().props;
  const [showDate, setShowDate] = useState(false);
  const [form, setForm] = useState({
    user_id: '',
    category: [],
    score: '',
    remarks: '',
    evaluated_at: '',
  });
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);

// State for filters
const [searchUser, setSearchUser] = useState('');
const [filterMonth, setFilterMonth] = useState(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
  return `${year}-${month}`;
});

  // Local errors state for client-side validation
  const [localErrors, setLocalErrors] = useState({});

  const categoryOptions = [
    'Communication',
    'Teamwork',
    'Problem Solving',
    'Attendance',
    'Productivity',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'category' ? (typeof value === 'string' ? value.split(',') : value) : value,
    }));
    // Clear error on field change
    setLocalErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};

    if (!form.user_id) errors.user_id = 'Employee is required.';
    if (!form.category || form.category.length === 0) errors.category = 'At least one category must be selected.';
    if (!form.score) errors.score = 'Performance rating is required.';
    if (!form.evaluated_at) errors.evaluated_at = 'Evaluation date is required.';

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    router.post(route('performances.store'), form, {
      onSuccess: () => {
        setForm({
          user_id: '',
          category: [],
          score: '',
          remarks: '',
          evaluated_at: '',
        });
        setShowDate(false);
        setOpen(false);
        setLocalErrors({});
      },
    });
  };

  const fetchUsers = () => {
    axios.get('/employee')
      .then((response) => setUsers(response.data))
      .catch((error) => {
        console.error('Error fetching users:', error);
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
      flex: 0.7,
      renderCell: (params) => params.row.user || '',
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 2,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const categories = params.value ? params.value.split(',') : [];
        return (
          <div style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            overflow: 'scroll'
          }}>
            {categories.map((cat, index) => (
              <Chip
                key={index}
                label={cat.trim()}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </div>
        );
      },
    },
    {
      field: 'score',
      headerName: 'Score',
      headerAlign: 'center',
      flex: 0.5,
      renderCell: ({ value }) => (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color={value >= 8 ? 'green' : value >= 5 ? 'orange' : 'red'}>
            {value}
          </Typography>
        </Box>
      ),
    },
    { field: 'evaluated_at', headerName: 'Date', flex: 1,
       renderCell: (params) =>
        new Date(params.row.evaluated_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
    })
     },
    { field: 'remarks', headerName: 'Remarks', flex: 1.5 },
  ];

  const handleChipDelete = (chipToDelete) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.filter((cat) => cat !== chipToDelete),
    }));
    setLocalErrors((prev) => ({ ...prev, category: '' }));
  };

  // Prepare rows from performances
  const rows = performances.map((perf, index) => ({
    id: index,
    user: perf.user.name,
    category: perf.category,
    score: perf.score,
    evaluated_at: perf.evaluated_at,
    remarks: perf.remarks,
  }));

  // Filter rows based on search and month
  const filteredRows = rows.filter((row) => {
    const matchesUser = searchUser
      ? row.user.toLowerCase().includes(searchUser.toLowerCase())
      : true;

    const matchesMonth = filterMonth
      ? new Date(row.evaluated_at).toISOString().slice(0, 7) === filterMonth
      : true;

    return matchesUser && matchesMonth;
  });

  return (
    <AuthenticatedLayout header={<Typography variant="h5">Employee Performance</Typography>} count={count}>
      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={2}>
              <TextField
               label="Search"
              variant="outlined"
              size="small"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  borderRadius: 2,
                  '&.MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ccc',
                    },
                    '&:hover fieldset': {
                      borderColor: '#bbb',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ccc',
                    },
                  },
                  '& input': {
                    boxShadow: 'none !important',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: '#666',
                  '&.Mui-focused': {
                    color: '#666',
                  },
                },
              }}
              sx={{
                maxWidth: 200,
                backgroundColor: 'background.paper',
              }}
              />
              <TextField
                type="month"
                variant="outlined"
                size="small"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                fullWidth
                InputProps={{
                    sx: {
                    borderRadius: 2,
                    '&.MuiOutlinedInput-root': {
                        '& fieldset': {
                        borderColor: '#ccc',
                        },
                        '&:hover fieldset': {
                        borderColor: '#bbb',
                        },
                        '&.Mui-focused fieldset': {
                        borderColor: '#ccc',
                        },
                    },
                    '& input': {
                        boxShadow: 'none !important',
                    },
                    },
                }}
                InputLabelProps={{
                    sx: {
                    color: '#666',
                    '&.Mui-focused': {
                        color: '#666',
                    },
                    },
                }}
                sx={{
                    maxWidth: 170,
                    backgroundColor: 'background.paper',
                }}
                />
            </Box>
            <Button onClick={() => setOpen(true)} variant="contained" sx={{ textTransform: 'capitalize', borderRadius: 2 }}>
              Add Performance
            </Button>
          </Box>

          {/* Popup Dialog Form */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
              Add Employee Performance
              <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Employee"
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  error={!!localErrors.user_id}
                  helperText={localErrors.user_id}
                >
                  <MenuItem value="" disabled>
                    Employee Name
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  error={!!localErrors.category}
                  helperText={localErrors.category}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => (
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            onDelete={() => handleChipDelete(value)}
                            onMouseDown={(event) => event.stopPropagation()}
                          />
                        ))}
                      </Box>
                    ),
                  }}
                >
                  {categoryOptions.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  select
                  label="Performance Rating"
                  name="score"
                  value={form.score}
                  onChange={handleChange}
                  error={!!localErrors.score}
                  helperText={localErrors.score}
                >
                  <MenuItem value="" disabled>Select Rating</MenuItem>
                  {[...Array(10)].map((_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {index + 1}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type={showDate ? 'date' : 'text'}
                  label="Evaluation Date"
                  name="evaluated_at"
                  value={form.evaluated_at}
                  onChange={handleChange}
                  onFocus={() => setShowDate(true)}
                  onBlur={(e) => { if (!e.target.value) setShowDate(false); }}
                  error={!!localErrors.evaluated_at}
                  helperText={localErrors.evaluated_at}
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
                  error={!!localErrors.remarks}
                  helperText={localErrors.remarks}
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
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader title="Performance List" />
            <Divider />
            <CardContent>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSize={5}
                autoHeight
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
