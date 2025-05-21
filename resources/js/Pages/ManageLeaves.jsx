import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import LoadingSpinner from '../Components/LoadingSpinner';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';

export default function ManageLeaves({ auth_user_id }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    leave_type: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    type: '',
    message: '',
    to_user_id: '',
  });
  const [users, setUsers] = useState([]);

  const [leaves, setLeaves] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [count,setCount] = useState(0);
  const [statusForm, setStatusForm] = useState({
    status: '',
    title: '',
    message: '',
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  const handleInquiryChange = (e) => {
  setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };
 
  const handleInquirySubmit = () => {
    axios
      .post('/inquiries',inquiryForm)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Inquiry sent successfully!',
          severity: 'success',
        });
        setInquiryOpen(false);
        setInquiryForm({ type: '', message: '', to_user_id: '' });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: 'Failed to send inquiry.',
          severity: 'error',
        });
      });
  };

  const fetchLeaves = () => {
    setLoading(true);
    axios
      .get('/leaves')
      .then((response) => setLeaves(response.data))
      .catch((error) => console.error('Error fetching leaves:', error))
      .finally(() => setLoading(false));
  };
    const pendingLeave = () => {
        axios
        .get('/admin/pending-leave')
        .then((response) => setCount(response.data))
        .catch((error) => console.error('Error fetching leaves:', error));
    };
    const fetchUserslist = () => {
        axios
        .get('/admin-hr-users')
        .then((response) => setUsers(response.data))
        .catch((error) => console.error('Error fetching leaves:', error));
    };

  useEffect(() => {
    pendingLeave();
    fetchLeaves();
    fetchUserslist();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setErrors({});
    const payload = {
      ...form,
      user_id: auth_user_id,
    };

    axios
      .post('/leaves', payload)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Leave request submitted successfully!',
          severity: 'success',
        });
        setOpen(false);
        setForm({
          start_date: '',
          end_date: '',
          leave_type: '',
          reason: '',
        });
        pendingLeave();
        fetchLeaves();
      })
      .catch((error) => {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to submit leave request.',
            severity: 'error',
          });
        }
      });
  };

  const openLeaveDialog = (leave_id, user_id) => {
    setSelectedLeaveId(leave_id);
    setStatusForm({
      user_id: user_id,
      status: '',
      title: '',
      message: '',
    });
    setStatusDialogOpen(true);
  };

  const handleStatusChange = (e) => {
    setStatusForm({ ...statusForm, [e.target.name]: e.target.value });
  };

  const handleLeaveResponseSubmit = async () => {
    try {
      await axios.post(`/leave-request/${selectedLeaveId}`, { statusForm });
      setSnackbar({
        open: true,
        message: 'Leave response submitted successfully!',
        severity: 'success',
      });
      setStatusDialogOpen(false);
      fetchLeaves();
      pendingLeave();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit leave response.',
        severity: 'error',
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold leading-tight text-gray-800">Leaves</h2>
        </div>
      }
      count={count}
    >
      <Head title="Leaves" />
      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold mb-4">Your Leave Requests</h3>
                {(user.user_role !== 'hr' && user.user_role !== 'admin') && (
                 <div className='flex justify-between gap-2'> <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setInquiryOpen(true)}
                    sx={{  marginBottom: '16px',textTransform: 'capitalize' }}
                  >
                    Send Inquiry
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpen(true)}
                    sx={{ marginBottom: '16px', textTransform: 'capitalize' }}
                  >
                    Request Leave
                  </Button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner />
                </div>
              ) : leaves.length === 0 ? (
                <p>No leave requests found.</p>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        {user.user_role === 'hr' && <TableCell>Leave Request</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.user.name}</TableCell>
                          <TableCell>{new Date(leave.start_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</TableCell>
                          <TableCell>{new Date(leave.end_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</TableCell>
                          <TableCell>{leave.leave_type}</TableCell>
                          <TableCell>{leave.reason}</TableCell>
                          <TableCell>
                            <Chip
                              label={leave.status}
                              color={getStatusColor(leave.status)}
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          {user.user_role === 'hr' && (
                            <TableCell>
                              <Button
                                onClick={() => openLeaveDialog(leave.id, leave.user_id)}
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: 'capitalize' }}
                              >
                                Leave
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Leave Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent dividers>

          <TextField
            label="Start Date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ my: 1 }}
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
          />

          <TextField
            label="End Date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ my: 1 }}
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
          />

          <TextField
            select
            label="Leave Type"
            name="leave_type"
            value={form.leave_type}
            onChange={handleChange}
            fullWidth
            sx={{ my: 1 }}
          >
            <MenuItem value="">Select Leave Type</MenuItem>
            <MenuItem value="sick">Sick Leave</MenuItem>
            <MenuItem value="casual">Casual Leave</MenuItem>
            <MenuItem value="earned">Earned Leave</MenuItem>
          </TextField>

          <TextField
            label="Reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            sx={{ my: 1 }}
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
                '& textarea': {
                    outline: 'none', 
                    border: 'none', 
                    boxShadow: 'none', 
                },
                },
            }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Inquiry</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Type"
            name="type"
            value={inquiryForm.type}
            onChange={handleInquiryChange}
            fullWidth
            sx={{ my: 1 }}
          >
            <MenuItem value="">Select Type</MenuItem>
            <MenuItem value="complaint">Complaint</MenuItem>
            <MenuItem value="suggestion">Suggestion</MenuItem>
            <MenuItem value="question">Question</MenuItem>
          </TextField>

          <TextField
            select
            label="Select User"
            name="to_user_id"
            value={inquiryForm.to_user_id}
            onChange={handleInquiryChange}
            fullWidth
            sx={{ my: 1 }}
          >
            <MenuItem value="">Select User</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Message"
            name="message"
            value={inquiryForm.message}
            onChange={handleInquiryChange}
            fullWidth
            multiline
            rows={4}
            sx={{ my: 1 }}
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
                '& textarea': {
                    outline: 'none', 
                    border: 'none',  
                    boxShadow: 'none',
                },
                },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiryOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleInquirySubmit} variant="contained" color="primary">Send</Button>
        </DialogActions>
      </Dialog>


      {/* Leave Response Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Leave Response</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Status"
            name="status"
            value={statusForm.status}
            onChange={handleStatusChange}
            fullWidth
            sx={{ my: 1 }}
          >
            <MenuItem value="">Select Status</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <TextField
            label="Title"
            name="title"
            value={statusForm.title}
            onChange={handleStatusChange}
            fullWidth
            sx={{ my: 1 }}
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
          />
          <TextField
            label="Message"
            name="message"
            value={statusForm.message}
            onChange={handleStatusChange}
            fullWidth
            multiline
            rows={3}
            sx={{ my: 1 }}
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
                '& textarea': {
                    outline: 'none', 
                    border: 'none',  
                    boxShadow: 'none',
                },
                },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleLeaveResponseSubmit} variant="contained" color="primary">Send</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AuthenticatedLayout>
  );
}
