import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Chip } from '@mui/material';

import {
  Box,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Modal,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import DownloadingIcon from '@mui/icons-material/Downloading';
import { DataGrid } from '@mui/x-data-grid';
import EditSalaryModal from './Users/EditSalary';

export default function ManageSalaries() {
  const { auth } = usePage().props;
  const user = auth.user;

  const isHR = user.user_role === 'hr';
  const isAdmin = user.user_role === 'admin';
  const isRestricted = !isHR && !isAdmin;

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
  });
  const [currentSalaryId, setCurrentSalaryId] = useState(null);
    const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'paid':
        return 'success';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    axios
      .get('/salaries')
      .then((response) => {
        setSalaries(response.data);
      })
      .catch((error) => {
        console.error('Error fetching salaries:', error);
        setError('Something went wrong while fetching salaries.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleEdit = (id) => {
    const salaryToEdit = salaries.find((s) => s.id === id);
    setSelectedSalary(salaryToEdit);
    setOpenEditModal(true);
  };

  const handleOpenNotification = (salaryId) => {
    setCurrentSalaryId(salaryId);
    setNotificationOpen(true);
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
    setNotificationData({ title: '', message: '' });
  };

  const handleSendNotification = async () => {
    try {
      await axios.post(`/salaries/paid/${currentSalaryId}`, notificationData);
      setSnackbar({
        open: true,
        message: 'Salary marked as paid and notification sent.',
        severity: 'success',
      });

      // Refresh list
      const response = await axios.get('/salaries');
      setSalaries(response.data);

      handleCloseNotification();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Failed to send notification.',
        severity: 'error',
      });
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        return <span>{params.row.user.name}</span>;
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.5,
      headerAlign: 'center',
      align: 'center',
       renderCell: (params) => {
      const status = params.row.status;
      const isPending = status === 'pending';

      return (
        // <Chip
        //   label={status.charAt(0).toUpperCase() + status.slice(1)}
        //   sx={{
        //     backgroundColor: isPending ? '#ffe0e6' : '#c8e6c9',
        //     color: isPending ? '#c2185b' : '#2e7d32',
        //     fontWeight: 'bold',
        //     textTransform: 'capitalize',
        //   }}
        //   size="small"
        // />
         <Chip
            label={status}
            color={getStatusColor(status)}
            variant="outlined"
            sx={{ textTransform: 'capitalize', mb:2 }}
          />
      );
    },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', gap: 1, width: '100%' }}
        >
          <IconButton color="default" size="small">
            <DownloadingIcon />
          </IconButton>

          {!isRestricted && (
            <IconButton
              onClick={() => handleEdit(params.row.id)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
...(!isRestricted
    ? [
        {
          field: 'Salary Status',
          headerName: 'Salary Status',
          flex: 1,
          headerAlign: 'center',
          align: 'center',
          sortable: false,
          renderCell: (params) => (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                width: '100%',
                textTransform: 'capitalize',
              }}
            >
              <Button
                onClick={() => handleOpenNotification(params.row.id)}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
                color="secondary"
              >
                Mark Paid
              </Button>
            </Box>
          ),
        },
      ]
    : []),
  ];

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Salaries
        </h2>
      }
    >
      <Head title="Salaries" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <Typography variant="h6" gutterBottom>
                Manage all salaries paid and pending
              </Typography>

              {loading && <p className="text-blue-600">Loading salaries...</p>}
              {error && <p className="text-red-600">{error}</p>}

              {!loading && !error && (
                <Box sx={{ width: '100%', minWidth: '600px' }}>
                  <DataGrid
                    rows={salaries}
                    columns={columns}
                    getRowId={(row) => row.id}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={{
                      boxShadow: 2,
                      borderRadius: 2,
                      '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f9fafb' },
                      '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
                        justifyContent: 'center',
                        textAlign: 'center',
                      },
                      '& .MuiDataGrid-cell': { padding: '8px 12px' },
                      '& .MuiDataGrid-row': { maxHeight: '48px' },
                    }}
                  />
                </Box>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Salary Modal */}
      <EditSalaryModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        salary={selectedSalary}
        onSalaryUpdated={(updatedSalary) => {
          setSalaries((prev) =>
            prev.map((s) => (s.id === updatedSalary.id ? updatedSalary : s))
          );
        }}
      />

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

      {/* Notification Modal */}
      <Modal open={notificationOpen} onClose={handleCloseNotification}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom textAlign="center">
           Send Notification And Mark Salary As Paid
          </Typography>
          {/* <Typography sx={{ mb: 2 }} textAlign="center" >
            Mark Salary As Paid
          </Typography> */}
          <TextField
            fullWidth
            label="Title"
            value={notificationData.title}
            onChange={(e) =>
              setNotificationData({ ...notificationData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Message"
            value={notificationData.message}
            onChange={(e) =>
              setNotificationData({ ...notificationData, message: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleCloseNotification}>Cancel</Button>
            <Button variant="contained" onClick={handleSendNotification}>
              Send
            </Button>
          </Box>
        </Box>
      </Modal>
    </AuthenticatedLayout>
  );
}
