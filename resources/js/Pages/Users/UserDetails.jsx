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
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';

import Notification from '@/Components/Notification';
import EditUser from './EditUser';
import { StatusChip } from '@/utils/StatusChip';

export default function UserDetail() {
  const { props } = usePage();
  const { user } = props;

  const [expanded, setExpanded] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [expandedLeaves, setExpandedLeaves] = useState({});

  const toggleReason = (index) => {
    setExpandedLeaves((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  //date formate
  const dateFormate = (date)=>{
    return  new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
  }

 const handleToggle = (panel) => (event, isExpanded) => {
    setExpanded((prevExpanded) =>
      isExpanded
        ? [...prevExpanded, panel]
        : prevExpanded.filter((item) => item !== panel)
    );
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

  const showDetails = (label, value, isCapitalize = true) => {
     return  <Box mb={1}>
              <Typography fontWeight="bold">{label}</Typography>
              <Typography mt={1} sx={{ textTransform: isCapitalize ? 'capitalize' : '' }}>{value}</Typography>
            </Box>
  }
  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl">User Detail</h2>}>
      <Head title="User Detail" />
      <Box className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Paper elevation={1} sx={{ p: 3, borderLeft: '6px solid #194d2f', borderRadius:"5px 5px 5px 0px" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">User Information</Typography>
            <IconButton onClick={() => editUser(user.id)} size="small"><EditIcon fontSize="small" /></IconButton>
          </Box>
          <Grid container spacing={2}>
              <Grid item size={4}>
                {showDetails('Name', user.name)}
              </Grid>
              <Grid item size={4}>
                {showDetails('Email', user.email,false)}
              </Grid>
              <Grid item size={4}>
                <Box mb={1}>
                  <Typography fontWeight="bold">Status</Typography>
                  <Typography sx={{ textTransform: 'capitalize' }}>{StatusChip(user.status)}</Typography>
                </Box>
              </Grid>
              <Grid item size={4}>
                 {showDetails('Role', user.user_role)}
              </Grid>
              <Grid item size={4}>
                {showDetails('Salary', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(user?.salary?.amount ?? user?.direct_salary))}
                
              </Grid>
              <Grid item size={4}>
                 {showDetails('Salary Status', StatusChip(user?.salary?.status) ?? 'N/A')}
              </Grid>
              {user?.salary?.status === 'paid' && (
                <Grid item size={4}>
                      {showDetails('Date', user?.salary?.date ? dateFormate(user.salary.date) : 'N/A')}
                </Grid>
              )}
          </Grid>
        </Paper>

        {/* Leave Details Accordion */}
        <Accordion expanded={expanded.includes('leave')}onChange={handleToggle('leave')} sx={{borderLeft: '6px solid #194d2f'}}>
          <AccordionSummary  expandIcon={expanded.includes('leave') ? <RemoveIcon /> : <AddIcon />}>
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold">Leave Details</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails >
            {user.leaves && user.leaves.length > 0 ? (
              user.leaves.map((leave, index) => (
                      <>
                    <Box sx={{backgroundColor: '#f9fafb', padding:1, marginBottom:1, borderRadius:"5px" }}>
                      <Grid container spacing={3}>
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
                                {showDetails('Action', <VisibilitySharpIcon onClick={() => toggleReason(index)} style={{ cursor: 'pointer' }}/>)}
                                {/* leave.reason */}
                              </Grid>
                      </Grid>
                    </Box>
                     {expandedLeaves[index] && <Box sx={{backgroundColor: '#f9fafb', padding:1.5, marginBottom:1, borderRadius:"5px" }}>
                      <Grid container spacing={1}>
                              <Grid >
                                {showDetails('Reason', leave.reason)}
                              </Grid>
                      </Grid>
                    </Box>
                    } 
                    </>
              ))
            ) : (
              <Typography color="text.secondary">No leave records.</Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* History Accordion */}
        <Accordion expanded={expanded.includes('history')} onChange={handleToggle('history')} sx={{borderLeft: '6px solid #194d2f'}}>
          <AccordionSummary expandIcon={expanded.includes('history') ? <RemoveIcon /> : <AddIcon />}>
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold">History</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {Array.isArray(user.history) && user.history.length > 0 ? (
              user.history.map((item) => (
                <Paper key={item.id} sx={{ p: 2, mb: 2, backgroundColor: '#f9fafb'}} elevation={0}>
                  <Typography>
                    <strong>{item.user?.name}:</strong> {item.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleString('en-IN', {
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
    </AuthenticatedLayout>
  );
}
