import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Box, Typography,IconButton, Button, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Visibility as VisibilityIcon, } from '@mui/icons-material';
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

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
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
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, width: '100%' }}>


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
    </AuthenticatedLayout>
  );
}
