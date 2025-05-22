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
  Divider,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';

import Notification from '@/Components/Notification';
import EditUser from './EditUser';

export default function UserDetail() {
  const { props } = usePage();
  const { user } = props;

  const [expanded, setExpanded] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleToggle = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const showNotification = (severity, message) => {
    setNotification({ open: true, severity, message });
  };
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const editUser = (id) => {
    setUserToEdit(user);
    setShowEditUserModal(true);
  };

  const fetchUsers = () => {
    router.reload({ only: ['user'] });
  };

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl">User Detail</h2>}>
      <Head title="User Detail" />

      <Box className="max-w-6xl mx-auto p-6">
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderLeft: '6px solid #1e293b' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">User Information</Typography>
            <IconButton onClick={() => editUser(user.id)} size="small"><EditIcon fontSize="small" /></IconButton>
          </Box>

          <Grid container spacing={5}>
            {/* Column 1 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={{ textTransform: 'capitalize' }}><strong>Name:</strong> {user.name}</Typography>
              <Typography sx={{ textTransform: 'capitalize' }}><strong>Email:</strong> {user.email}</Typography>
              <Typography sx={{ textTransform: 'capitalize' }}>
                <strong>Status:</strong> {user.status === 1 ? "Active" : "Inactive"}
              </Typography>
            </Grid>

            {/* Column 2 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={{ textTransform: 'capitalize' }}><strong>Role:</strong> {user.user_role}</Typography>
              <Typography sx={{ textTransform: 'capitalize' }}>
                <strong>Created At:</strong> {new Date(user.created_at).toLocaleDateString()}
              </Typography>
              <Typography sx={{ textTransform: 'capitalize' }}>
                <strong>Updated At:</strong> {new Date(user.updated_at).toLocaleDateString()}
              </Typography>
            </Grid>

            {/* Column 3 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={{ textTransform: 'capitalize' }}>
                <strong>Salary:</strong> {user?.salary?.amount ?? user?.direct_salary}
              </Typography>
              <Typography sx={{ textTransform: 'capitalize' }}>
                <strong>Salary Status:</strong> {user?.salary?.status ?? 'N/A'}
              </Typography>
              {user?.salary?.status === 'paid' && (
                <Typography sx={{ textTransform: 'capitalize' }}>
                  <strong>Date:</strong> {user?.salary?.date ? new Date(user.salary.date).toLocaleDateString() : 'N/A'}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Leave Details Accordion */}
        <Accordion expanded={expanded === 'leave'} onChange={handleToggle('leave')}>
          <AccordionSummary expandIcon={expanded === 'leave' ? <RemoveIcon /> : <AddIcon />}>
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold">Leave Details</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {user.leaves && user.leaves.length > 0 ? (
              user.leaves.map((leave, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }} elevation={1}>
                  <Grid container spacing={5}>
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Type:</strong> {leave.leave_type}</Typography>
                      <Typography><strong>Start:</strong> {new Date(leave.start_date).toLocaleDateString()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Reason:</strong> {leave.reason}</Typography>
                      <Typography><strong>End:</strong> {new Date(leave.end_date).toLocaleDateString()}</Typography>
                      <Typography><strong>Status:</strong> {leave.status}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">No leave records.</Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* History Accordion */}
        <Accordion expanded={expanded === 'history'} onChange={handleToggle('history')}>
          <AccordionSummary expandIcon={expanded === 'history' ? <RemoveIcon /> : <AddIcon />}>
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold">History</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {Array.isArray(user.history) && user.history.length > 0 ? (
              user.history.map((item) => (
                <Paper key={item.id} sx={{ p: 2, mb: 2, backgroundColor: '#f9fafb' }} elevation={0}>
                  <Typography>
                    <strong>{item.user?.name}:</strong> {item.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                        })}

                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography className="italic text-gray-500 text-center">No history found</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Edit Modal */}
      {showEditUserModal && userToEdit && (
        <EditUser
          user={userToEdit}
          onClose={() => {
            setShowEditUserModal(false);
            setUserToEdit(null);
          }}
          onUpdated={() => {
            fetchUsers();
            showNotification('success', 'User updated successfully.');
          }}
        />
      )}

      {/* Notification */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </AuthenticatedLayout>
  );
}
