import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import AddUser from './Users/AddUser';
import SendNotification from './Users/SendNotification';
import EditUser from './Users/EditUser';
import UserDetails from './Users/UserDetails'; // <-- new component import

import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import Notification from '@/Components/Notification';
import { router } from '@inertiajs/react';

export default function ManageUsers() {
  const { auth } = usePage().props;
  const user = auth.user;

  const [users, setUsers] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [singleUser, setSingleUser] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [count, setCount] = useState(0);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const pendingLeave = () => {
    axios
      .get('/admin/pending-leave')
      .then((response) => setCount(response.data))
      .catch((error) => console.error('Error fetching leaves:', error));
  };

  const showNotification = (severity, message) => {
    setNotification({ open: true, severity, message });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchUsers();
    fetchEmployee();
    pendingLeave();
  }, []);

  const fetchUsers = () => {
    axios.get('/list')
      .then((response) => setUsers(response.data))
      .catch((error) => {
        console.error('Error fetching users:', error);
        showNotification('error', 'Failed to load users.');
      });
  };

  // const fetchSingleUser = (id) => {
  //   axios.get(`/admin/users/${id}`)
  //     .then((response) => {
  //       setSingleUser(response.data);
  //       setShowUserDetailsModal(true);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching user:', error);
  //       showNotification('error', 'Failed to load user.');
  //     });
  // };

  const fetchEmployee = () => {
    axios.get('/employee')
      .then((response) => setEmployee(response.data))
      .catch((error) => {
        console.error('Error fetching employees:', error);
        showNotification('error', 'Failed to load employees.');
      });
  };

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    axios.delete(`/admin/users/${selectedUserId}`)
      .then(() => {
        setUsers(prev => prev.filter(user => user.id !== selectedUserId));
        showNotification('success', 'User deleted successfully.');
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        showNotification('error', 'Failed to delete user.');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedUserId(null);
      });
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUserId(null);
  };

  const handleEditUser = (id) => {
    const user = users.find((u) => u.id === id);
    setUserToEdit(user);
    setShowEditUserModal(true);
  };


  const handleUserAdded = (newUser) => {
    setUsers(prev => [...prev, newUser]);
    setShowAddUserModal(false);
    showNotification('success', 'User added successfully.');
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center', renderCell: (params) => <span style={{ textTransform: 'capitalize' }}>{params.value}</span> },
    { field: 'email', headerName: 'Email', flex: 1.5, headerAlign: 'center', align: 'center' },
    { field: 'user_role', headerName: 'Role', flex: 1, headerAlign: 'center', align: 'center', renderCell: (params) => <span style={{ textTransform: 'capitalize' }}>{params.value}</span> },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, width: '100%' }}>
          <IconButton size="small" aria-label="view" onClick={() => router.visit(`/admin/users/${params.row.id}`)}>
            <VisibilityIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => handleEditUser(params.row.id)} color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Employees</h2>}
      count={count}
    >
      <Head title="Manage Employees" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search & Buttons */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                maxWidth: 320,
                backgroundColor: 'background.paper',
              }}
            />

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {(user.user_role === 'hr') && (
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
                >
                  Send Notification
                </button>
              )}
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
              >
                Add Employee
              </button>
            </div>
          </div>

          {/* Modals */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  &times;
                </button>
                <h2 className="text-lg font-bold mb-4">Add New Employee</h2>
                <AddUser onUserAdded={handleUserAdded} />
              </div>
            </div>
          )}

          {showNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </button>
                <SendNotification
                  onSent={() => setShowNotificationModal(false)}
                  employees={employee}
                />
              </div>
            </div>
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                <p className="mb-6 text-gray-700">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {/* Use UserDetails component */}
          {showUserDetailsModal && singleUser && (
            <UserDetails
              user={singleUser}
              onClose={() => setShowUserDetailsModal(false)}
            />
          )}

          {/* User Data Table */}
          <div className="overflow-x-auto bg-white shadow-sm sm:rounded-lg">
            <div className="p-4 text-gray-900 min-w-[500px]">
              <h3 className="mb-4 text-lg font-medium">List of current employees:</h3>
              <Box sx={{ width: '100%' }}>
                <DataGrid
                  rows={filteredUsers}
                  columns={columns}
                  autoHeight
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 5, page: 0 },
                    },
                  }}
                />
              </Box>
            </div>
          </div>
        </div>
      </div>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </AuthenticatedLayout>
  );
}
