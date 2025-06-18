import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataGrid } from '@mui/x-data-grid';
import {
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Policies() {
  const { policies, flash, auth, errors } = usePage().props;
  const user = auth.user;

  const { data, setData, post, reset, processing, put } = useForm({
    title: '',
    description: '',
    uploaded_date: '',
    file: null,
  });

  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [confirmingPolicyDeletion, setConfirmingPolicyDeletion] = useState(false);
  const [deletingPolicyId, setDeletingPolicyId] = useState(null);
  const [deleteProcessing, setDeleteProcessing] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuAnchorEls, setMenuAnchorEls] = useState({});

  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash?.success]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('policies.store'), {
      onSuccess: () => reset(),
    });
  };

  const confirmPolicyDelete = (id) => {
    setDeletingPolicyId(id);
    setConfirmingPolicyDeletion(true);
    handleMenuClose(id);
  };

  const closeModal = () => {
    setConfirmingPolicyDeletion(false);
    setDeletingPolicyId(null);
  };

  const deletePolicy = (e) => {
    e.preventDefault();
    setDeleteProcessing(true);
    router.delete(route('policies.destroy', deletingPolicyId), {
      onSuccess: () => {
        setConfirmingPolicyDeletion(false);
        setDeleteProcessing(false);
      },
      onError: () => setDeleteProcessing(false),
    });
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setData({
      title: policy.title,
      description: policy.description,
      uploaded_date: policy.uploaded_date,
      file: null,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingPolicy(null);
    setShowEditModal(false);
    reset();
  };

  const updatePolicy = (e) => {
    e.preventDefault();
    if (!editingPolicy) return;

    router.post(route('policies.update', editingPolicy.id), {
      _method: 'put',
      ...data,
    }, {
      onSuccess: () => {
        closeEditModal();
      },
    });
  };

  const handleMenuOpen = (event, id) => {
    setMenuAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }));
  };

  const handleMenuClose = (id) => {
    setMenuAnchorEls((prev) => ({ ...prev, [id]: null }));
  };

  const columns = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'uploadedDate',
      headerName: 'Uploaded Date',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'uploadedBy',
      headerName: 'Uploaded By',
      flex: 1,
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
      renderCell: (params) => {
        const open = Boolean(menuAnchorEls[params.row.id]);
        const userRole = user.user_role;
        const selectedPolicy = policies.find(p => p.id === params.row.id);

        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <IconButton
              href={route('policies.view', params.row.id)}
              target="_blank"
              rel="noopener"
              size="small"
              sx={{ mr: 1 }}
            >
              <VisibilityIcon color="action" />
            </IconButton>

            <IconButton
              aria-controls={open ? `actions-menu-${params.row.id}` : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={(e) => handleMenuOpen(e, params.row.id)}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>

            <Menu
              id={`actions-menu-${params.row.id}`}
              anchorEl={menuAnchorEls[params.row.id]}
              open={open}
              onClose={() => handleMenuClose(params.row.id)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                component="a"
                href={route('policies.download', params.row.id)}
                target="_blank"
                rel="noopener"
                onClick={() => handleMenuClose(params.row.id)}
              >
                <DownloadIcon sx={{ mr: 1 }} />
                Download
              </MenuItem>

              {(userRole === 'admin' || userRole === 'hr') && (
                <>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose(params.row.id);
                      openEditModal(selectedPolicy);
                    }}
                  >
                    <EditSquareIcon sx={{ mr: 1 }} />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={() => { confirmPolicyDelete(params.row.id); }}>
                    <DeleteIcon color="error" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
        );
      },
    },
  ];

  const rows = policies.map((policy) => ({
    id: policy.id,
    title: policy.title,
    description: policy.description,
    uploadedBy: policy.uploader.name,
    uploadedDate: new Date(policy.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }));

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Company Policies List
        </h2>
      }
    >
      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

          {showSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {flash.success}
            </Alert>
          )}

          {(user.user_role === 'admin' || user.user_role === 'hr') && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
              <div>
                <input
                  type="text"
                  placeholder="Policy Title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full border p-2 rounded"
                />
                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
              </div>

              <div>
                <textarea
                  placeholder="Description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full border p-2 rounded"
                />
                {errors.description && (
                  <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                )}
              </div>

              <div>
                <input
                  type="file"
                  onChange={(e) => setData('file', e.target.files[0])}
                  className="block"
                />
                {errors.file && <div className="text-red-500 text-sm mt-1">{errors.file}</div>}
              </div>

              <button
                type="submit"
                disabled={processing}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Upload Policy
              </button>
            </form>
          )}

          <div className="mt-8">
            <Box sx={{ height: 600, width: 'auto', backgroundColor: 'white' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                disableSelectionOnClick
              />
            </Box>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal show={confirmingPolicyDeletion} onClose={closeModal}>
        <form onSubmit={deletePolicy} className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Do you want to delete this policy?
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Once deleted, this policy and all related data will be permanently removed. This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeModal}>
              Cancel
            </SecondaryButton>
            <DangerButton className="ms-3" disabled={deleteProcessing}>
              Delete Policy
            </DangerButton>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={closeEditModal}>
        <form onSubmit={updatePolicy} className="p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Edit Policy</h2>

          <input
            type="text"
            placeholder="Policy Title"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            className="w-full border p-2 rounded"
          />
          {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}

          <textarea
            placeholder="Description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            className="w-full border p-2 rounded"
          />
          {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}

          <input
            type="file"
            onChange={(e) => setData('file', e.target.files[0])}
            className="block"
          />
          {errors.file && <div className="text-red-500 text-sm mt-1">{errors.file}</div>}

          <div className="mt-4 flex justify-end">
            <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
            <button
              type="submit"
              disabled={processing}
              className="ml-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
