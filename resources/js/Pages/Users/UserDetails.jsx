import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  Grid,
  Paper,
  Button,
  TextField,
  Modal,
  Card,
  CardContent,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import { CalendarClock } from 'lucide-react';

import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

import Notification from '@/Components/Notification';
import EditUser from './EditUser';
import { StatusChip } from '@/utils/StatusChip';

export default function UserDetail() {
  const { props } = usePage();
  const { user } = props;

  if (!user) {
    return <Typography>User not found or data not loaded.</Typography>;
  }

  const [expanded, setExpanded] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [expandedLeaves, setExpandedLeaves] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    user_id: user.id,
    amount: '',
    bonus: '',
    date: '',
    unpaid_leave_days: '',
  });

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    router.post(
      '/reset-password',
      {
        user_id: user.id,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: () => {
          setShowPasswordFields(false);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
        },
        onError: (errors) => {
          setPasswordError(errors.message || 'Failed to reset password.');
        },
      }
    );
  };

  const toggleReason = (index) => {
    setExpandedLeaves((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  //date format
  const dateFormate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleToggle = (panel) => (event, isExpanded) => {
    setExpanded((prevExpanded) =>
      isExpanded ? [...prevExpanded, panel] : prevExpanded.filter((item) => item !== panel)
    );
  };

  const showNotification = (severity, message) => {
    setNotification({ open: true, severity, message });
  };
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const editUser = (id) => {
    setUserToEdit(user);
    setShowEditUserModal(true);
  };

  const fetchUsers = () => {
    router.reload({ only: ['user'] });
  };

  const showDetails = (label, value, isCapitalize = true) => {
    return (
      <Box mb={1}>
        <Typography fontWeight="bold">{label}</Typography>
        <Typography mt={1} sx={{ textTransform: isCapitalize ? 'capitalize' : '' }}>
          {value}
        </Typography>
      </Box>
    );
  };

  const formatDate = (dateStr) => new Date(dateStr);

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl">User Detail</h2>}>
      <Head title="User Detail" />
      <Box className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Paper elevation={1} sx={{ p: 3, borderLeft: '6px solid #194d2f', borderRadius: '5px 5px 5px 0px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              User Information
            </Typography>
            {/* <IconButton onClick={() => editUser(user.id)} size="small">
              <EditIcon fontSize="small" />
            </IconButton> */}
             <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
              Add Salary
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item size={3}>
              {showDetails('Name', user.name)}
            </Grid>
            <Grid item size={3}>
              {showDetails('Email', user.email, false)}
            </Grid>
            <Grid item size={3}>
              <Box mb={1}>
                <Typography fontWeight="bold">Status</Typography>
                <Typography sx={{ textTransform: 'capitalize' }}>{StatusChip(user.status)}</Typography>
              </Box>
            </Grid>
            <Grid item size={3}>
              {showDetails('Role', user.user_role)}
            </Grid>
            <Grid item size={3}>
              {showDetails(
                'Salary',
                new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                  user?.salary?.amount ?? user?.direct_salary
                )
              )}
            </Grid>
            <Grid item size={3}>
              {showDetails('Salary Status', StatusChip(user?.salary?.status) ?? 'N/A')}
            </Grid>
            {user?.salary?.status === 'paid' && (
              <Grid item size={3}>
                {showDetails('Date', user?.salary?.date ? dateFormate(user.salary.date) : 'N/A')}
              </Grid>
            )}
          </Grid>

          <Box mt={3}>
            {!showPasswordFields ? (
              <Button variant="contained" onClick={() => setShowPasswordFields(true)}>
                Reset Password
              </Button>
            ) : (
              <Box display="flex" flexDirection="column" gap={2} mt={2} maxWidth={400}>
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordError && (
                  <Typography color="error" variant="body2">
                    {passwordError}
                  </Typography>
                )}
                <Box display="flex" gap={2}>
                  <Button variant="outlined" onClick={() => setShowPasswordFields(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleResetPassword}>
                    Save
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Leave Details Accordion */}
        <Accordion
          expanded={expanded.includes('leave')}
          onChange={handleToggle('leave')}
          sx={{ borderLeft: '6px solid #194d2f' }}
        >
          <AccordionSummary expandIcon={expanded.includes('leave') ? <RemoveIcon /> : <AddIcon />}>
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold">
                Leave Details
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {user.leaves && user.leaves.length > 0 ? (
              user.leaves.map((leave, index) => (
                <React.Fragment key={leave.id ?? index}>
                  <Box sx={{ backgroundColor: '#f9fafb', padding: 1, marginBottom: 1, borderRadius: '5px' }}>
                    <Grid container spacing={2}>
                      <Grid item size={3}>
                        {showDetails('Type', leave.leave_type)}
                      </Grid>
                      <Grid item size={3}>
                        {showDetails('Status', StatusChip(leave.status))}
                      </Grid>
                      <Grid item size={3}>
                        {showDetails('Date', `${dateFormate(leave.start_date)} - ${dateFormate(leave.end_date)}`)}
                      </Grid>
                      <Grid item size={3}>
                        {showDetails('Action', <VisibilitySharpIcon onClick={() => toggleReason(index)} style={{ cursor: 'pointer' }} />)}
                      </Grid>
                    </Grid>
                    {expandedLeaves[index] && (
                      <Box mt={1} sx={{ backgroundColor: '#e0e0e0', borderRadius: '5px', padding: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Reason:
                        </Typography>
                        <Typography>{leave.reason}</Typography>
                      </Box>
                    )}
                  </Box>
                </React.Fragment>
              ))
            ) : (
              <Typography>No leave records found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Edit User Modal */}
        {showEditUserModal && userToEdit && (
          <EditUser
            user={userToEdit}
            open={showEditUserModal}
            onClose={() => setShowEditUserModal(false)}
            onUserUpdated={() => {
              setShowEditUserModal(false);
              fetchUsers();
            }}
          />
        )}

        {/* Notification Snackbar */}
        <Notification
          open={notification.open}
          severity={notification.severity}
          message={notification.message}
          onClose={handleNotificationClose}
        />

        {/* Add Salary Modal */}
        <Modal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="modal-title" variant="h6" component="h2" mb={2}>
              Add Salary
            </Typography>
              <IconButton
                  onClick={() => setOpenAddModal(false)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: (theme) => theme.palette.grey[600],
                  }}
                >
                  <CloseIcon />
                </IconButton>
            <Card>
              <CardContent>
                <TextField
                  margin="normal"
                  fullWidth
                  type="number"
                  label="Salary Amount"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon />
                      </InputAdornment>
                    ),
                  }}
                  value={salaryForm.amount}
                  onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#ccc',
                        },
                        '&:hover fieldset': {
                          borderColor: '#ccc',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ccc',
                        },
                      },
                      '& input': {
                        outline: 'none !important',
                        boxShadow: 'none !important',
                      },
                      '& input:focus': {
                        outline: 'none !important',
                        boxShadow: 'none !important',
                      },
                    }}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  type="number"
                  label="Bonus"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon />
                      </InputAdornment>
                    ),
                  }}
                  value={salaryForm.bonus}
                  onChange={(e) => setSalaryForm({ ...salaryForm, bonus: e.target.value })}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ccc',
                          },
                          '&:hover fieldset': {
                            borderColor: '#ccc',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ccc',
                          },
                        },
                        '& input': {
                          outline: 'none !important',
                          boxShadow: 'none !important',
                        },
                        '& input:focus': {
                          outline: 'none !important',
                          boxShadow: 'none !important',
                        },
                      }}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    type="number"
                    label="Unpaid Leave Days"
                    value={salaryForm.unpaid_leave_days}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, unpaid_leave_days: e.target.value })
                    }
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#ccc',
                        },
                        '&:hover fieldset': {
                          borderColor: '#ccc',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ccc',
                        },
                      },
                      '& input': {
                        outline: 'none !important',
                        boxShadow: 'none !important',
                      },
                      '& input:focus': {
                        outline: 'none !important',
                        boxShadow: 'none !important',
                      },
                    }}
                  />

                <TextField
                  margin="normal"
                  fullWidth
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon />
                      </InputAdornment>
                    ),
                  }}
                  value={salaryForm.date}
                  onChange={(e) => setSalaryForm({ ...salaryForm, date: e.target.value })}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ccc',
                          },
                          '&:hover fieldset': {
                            borderColor: '#ccc',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ccc',
                          },
                        },
                        '& input': {
                          outline: 'none !important',
                          boxShadow: 'none !important',
                        },
                        '& input:focus': {
                          outline: 'none !important',
                          boxShadow: 'none !important',
                        },
                      }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => {
                    axios
                      .post('/salaries/add', salaryForm)
                      .then(() => {
                        setOpenAddModal(false);
                        setSalaryForm({ ...salaryForm, amount: '', bonus: '', date: '',unpaid_leave_days:'' });
                        showNotification('success', 'Salary added successfully!');
                      })
                      .catch(() => {
                        showNotification('error', 'Failed to add salary.');
                      });
                  }}
                >
                  Submit
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Modal>
      </Box>
    </AuthenticatedLayout>
  );
}
