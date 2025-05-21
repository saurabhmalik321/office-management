import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import LoadingSpinner from '../Components/LoadingSpinner';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Modal,
  TextField,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import "jspdf-autotable";
import html2canvas from 'html2canvas';
import DownloadingIcon from '@mui/icons-material/Downloading';
import { DataGrid } from '@mui/x-data-grid';
import EditSalary from './Users/EditSalary';
import { useMediaQuery, useTheme } from '@mui/material';



export default function ManageSalaries() {
  const { auth } = usePage().props;
  const user = auth.user;

  const isHR = user.user_role === 'hr';
  const isAdmin = user.user_role === 'admin';
  const isRestricted = !isHR && !isAdmin;
  const [salary, setSalary] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [count,setCount] = useState(0);
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
  const pendingLeave = () => {
      axios
      .get('/admin/pending-leave')
      .then((response) => setCount(response.data))
      .catch((error) => console.error('Error fetching leaves:', error));
    };
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
      .then((response) => setSalaries(response.data))
      .catch((error) => {
        console.error('Error fetching salaries:', error);
        setError('Something went wrong while fetching salaries.');
      })
      .finally(() => setLoading(false));
  }, [salary,pendingLeave()]);

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


const handleDownloadPdf = (row) => {
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.width = '595px';

  const formattedDate = new Date(row.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const monthName = new Date(row.date).toLocaleString('en-IN', {
    month: 'long',
  });

  const capitalizedStatus =
    row.status.charAt(0).toUpperCase() + row.status.slice(1);

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(row.amount);

  // Add inner HTML
const pfCut = 1000;
const taxCut = 2000;
const netSalary = row.amount - taxCut - pfCut;

pdfContainer.innerHTML = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 700px; margin: auto; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="/wepro.png" alt="Company Logo" style="width: 120px; background-color:black" />
      <h2 style="margin: 10px 0 0; color: #222;">Wepro Solutions Pvt. Ltd.</h2>
      <p style="margin: 2px 0; font-size: 12px; color: #555;">Sector 74 , Industrial Area, Mohali City(Punjab), India</p>
      <p style="margin: 2px 0 0; font-size: 12px; color: #555;">Email: hr@weproinc.com | Phone: +91 98765 43210</p>
    </div>

    <!-- Title -->
    <h1 style="text-align: center; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; margin-bottom: 30px;">Salary Slip - ${monthName}</h1>

    <!-- Introduction -->
    <p style="font-size: 14px; color: #333; margin-bottom: 25px;">
      Dear <strong>${row?.name}</strong>,<br />
      We are pleased to confirm the disbursement of your salary for the month of <strong>${monthName}</strong>. Below is the detailed salary breakdown:
    </p>

    <!-- Salary Table -->
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
      <tbody>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Employee Name</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${row?.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Gross Salary</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${formattedAmount}</td>
        </tr>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Tax Deduction (TDS)</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">₹${taxCut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Provident Fund (PF)</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">₹${pfCut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        </tr>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Net Salary</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right; font-weight: bold; color: #2c3e50;">
            ₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Date of Payment</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${formattedDate}</td>
        </tr>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Payment Status</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${capitalizedStatus}</td>
        </tr>
      </tbody>
    </table>

       <!-- Signature -->
    <div style="margin-top: 60px; text-align: right;">
      <p style="margin-bottom: 5px;">Authorized Signatory</p>
      <img src="/signature.png" alt="Signature" style="width: 120px; margin-bottom: 5px; display: block; margin-left: auto;" />
       <p style="font-size: 15px;">Nitin Goswami</p>
      <p style="font-size: 12px; margin: 0;">CEO & Founder</p>
    </div>
  </div>
`;


  document.body.appendChild(pdfContainer);

  html2canvas(pdfContainer, {
    scale: 2,
    useCORS: true,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${row?.name}_SalarySlip.pdf`);

    document.body.removeChild(pdfContainer);
  });
};



const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isTablet = useMediaQuery(theme.breakpoints.down('md'));


  const columns = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => <span>{params.row?.name}</span>,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) =>
      params.row.amount
        ? Number(params.row.amount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
          })
        : 'No salary detected',
  },
  {
    field: 'date',
    headerName: 'Date',
    flex: 1,
    minWidth: 130,
    hide: isMobile, // Hides on mobile
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) =>
      new Date(params.row.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.5,
    minWidth: 100,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.row.status}
        variant="outlined"
        sx={{
          textTransform: 'capitalize',
          backgroundColor:
            params.row.status === 'pending' ? '#ffe6ea' : 'lightgreen',
          color: '#000',
          marginBottom:2.5,
        }}
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    flex: 1,
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <IconButton size="small" onClick={() => handleDownloadPdf(params.row)}>
          <DownloadingIcon />
        </IconButton>
        {!isRestricted && (
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row.id)}
            color="primary"
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
          minWidth: 160,
          hide: isMobile || isTablet, // Hides on tablet & mobile
          headerAlign: 'center',
          align: 'center',
          sortable: false,
          renderCell: (params) => (
            <Button
              onClick={() => handleOpenNotification(params.row.id)}
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ textTransform: 'capitalize', marginBottom:2.5}}
            >
              Mark Paid
            </Button>
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
      count={count}
    >
      <Head title="Salaries" />
      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <Typography variant="h6" gutterBottom>
                Employees salaries paid and pending
              </Typography>

              {loading && <LoadingSpinner/> }
              {error && <p className="text-red-600">{error}</p>}

              {!loading && !error && (
                <Box sx={{ width: '100%',  overflowX: 'auto'}}>
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
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f9fafb',
                      },
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

      {/* Edit Modal */}
      <EditSalary
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        salary={selectedSalary}
        onSalaryUpdated={(updatedSalary) =>
          setSalary((prev) =>
            prev.map((s) => (s.id === updatedSalary.id ? updatedSalary : s))
          )

        }
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
          <TextField
            fullWidth
            label="Title"
            value={notificationData.title}
            onChange={(e) =>
              setNotificationData({
                ...notificationData,
                title: e.target.value,
              })
            }
            sx={{ mb: 2 }}
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
            fullWidth
            multiline
            rows={3}
            label="Message"
            value={notificationData.message}
            onChange={(e) =>
                setNotificationData({
                ...notificationData,
                message: e.target.value,
                })
            }
            sx={{ mb: 2 }}
            InputProps={{
                sx: {
                borderRadius: 2,
                '&.MuiOutlinedInput-root': {
                    '& fieldset': {
                    borderColor: '#ccc', // Border color when not focused
                    },
                    '&:hover fieldset': {
                    borderColor: '#bbb', // Border color on hover
                    },
                    '&.Mui-focused fieldset': {
                    borderColor: '#ccc', // Border color when focused
                    },
                },
                '& textarea': {
                    outline: 'none', // Removes the default focus outline from textarea
                    border: 'none',  // Remove any inner border that appears
                    boxShadow: 'none', // Remove any box shadow that may appear on focus
                },
                },
            }}
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
