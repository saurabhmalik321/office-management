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
  MenuItem,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Grid
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
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  maxWidth: '90%',
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: 24,
  p: 3,
};



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
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    date: '',
  });
  const [currentSalaryId, setCurrentSalaryId] = useState(null);
  const [users, setUsers] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    user_id: '',
    amount: '',
    date: '',
    status: 'Pending',
  });
  const [salaryData,setSalaryData] = useState([]);

  const [openCalculator, setOpenCalculator] = useState(false);
  const [salaryForms, setSalaryForms] = useState({
    basic_salary: '',
    bonus: '',
    tax_percent: '',
    pf_percent: '',
    unpaid_leave_days: '',
    calculated_salary: null,
    breakdown: null,
  });
  const [leaveCount,setLeaveCount] = useState(0);
  const [openSalaryModal, setOpenSalaryModal] = useState(false);

  const pendingLeave = () => {
      axios
      .get('/admin/pending-leave')
      .then((response) => setCount(response.data))
      .catch((error) => console.error('Error fetching leaves:', error));
    };

    useEffect(()=>{
      pendingLeave();
    },[])
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

   const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

   useEffect(() => {
      const today = new Date();
      setSelectedMonth(today.getMonth() + 1); 
      setSelectedYear(today.getFullYear());
    }, []);

  useEffect(() => {
    axios
      .get('/salaries')
      .then((response) => setSalaries(response.data))
      .catch((error) => {
        console.error('Error fetching salaries:', error);
        setError('Something went wrong while fetching salaries.');
      })
      .finally(() => setLoading(false));
  }, [salary]);

  const handleEdit = (id) => {
    const salaryToEdit = salaries.find((s) => s.id === id);
    setSelectedSalary(salaryToEdit);
    setOpenEditModal(true);

  };

  const fetchUsers = () => {
    axios.get('/employee')
      .then((response) => setUsers(response.data))
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  };

  useEffect(() => {
      fetchUsers();
    }, []);

  const handleOpenNotification = (salaryId) => {
    setCurrentSalaryId(salaryId);
    setNotificationOpen(true);
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
    setNotificationData({ title: '', message: '',date:'' });
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
      getDefaultMonth();
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
  if(user.user_role == 'employee'){
    useEffect(()=>{
       axios.get('/single-salaries')
      .then((response) => setSalaries(response.data))
      .catch((error) => {
        console.error('Error fetching single user salary:', error);
        setError('Something went wrong while fetching salaries.');
      })
      .finally(() => setLoading(false));
    },[])
  }
  useEffect(()=>{
     if(user.user_role == 'employee'){
    axios.get('/leave-count')
    .then((res)=>setLeaveCount(res.data))
    .catch((error) => {
        console.error('Error fetching leave count:', error);
        setError('Something went wrong while fetching leave.');
      })
    }
  },[]);
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
const pfCut = Math.round((2 / 100) * row.amount);
const taxCut = Math.round((6 / 100) * row.amount);
const leaveCut = leaveCount * Math.floor(row.amount / 22);
const netSalary = row.amount - taxCut - pfCut - leaveCut;

pdfContainer.innerHTML = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 700px; margin: auto; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="/image.png" alt="Company Logo" style="width: 120px;" />
      <h2 style="margin: 10px 0 0; color: #222;">Wepro Solutions Pvt. Ltd.</h2>
      <p style="margin: 2px 0; font-size: 12px; color: #555;">Sector 74 , Industrial Area, Mohali City(Punjab), India</p>
      <p style="margin: 2px 0 0; font-size: 12px; color: #555;">Email: hr@weproinc.com | Phone: +91 9780446281</p>
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
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Leave Deduction</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">₹${leaveCut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
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

const viewSalary=(id,date)=>{
  const salary={id:id,date:date};
    axios.post('/salary-view',salary)
     .then((res)=>{setSalaryData(res.data)
       setOpenSalaryModal(true);
     })
     .catch((err)=>console.log(err));
}
console.log(salaryData,"salarydata");
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const handleFilter = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/salaries/filter', {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
        });
        setSalaries(response.data);
      } catch (error) {
        console.error('Error filtering salaries:', error);
        setError('Something went wrong while filtering salaries.');
      } finally {
        setLoading(false);
      }
    };


    const getDefaultMonth=async()=>{
      const today = new Date();
      const month = today.getMonth()+1;
      const year = today.getFullYear();
      const response=await axios.get('/salaries/filter', {
        params: {
          month: month,
          year:year,
        },
      });
      setSalaries(response.data);
    }
    useEffect(() => {
    getDefaultMonth();
    }, []);


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
        //  {console.log(params.row.status,"status")}
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
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        minWidth: 120,
        headerAlign: 'center',
        align: 'center',
        sortable: false,
       renderCell: (params) => {
        const date = new Date(params.row.date).toISOString().split('T')[0];
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            {((user.user_role === 'employee' && params.row.status === 'paid') || user.user_role === 'admin') && (
              <IconButton size="small" onClick={() => handleDownloadPdf(params.row)}>
                <DownloadingIcon />
              </IconButton>
            )}

            <IconButton size="small" aria-label="view">
              <VisibilityIcon color="primary" onClick={() => viewSalary(params.row.user_id, date)} />
            </IconButton>

            {!isRestricted && (
              <IconButton size="small" onClick={() => handleEdit(params.row.id)} color="primary">
                <EditIcon />
              </IconButton>
            )}
          </Box>
        );
      }

      },
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

              {loading && <LoadingSpinner/> }
              {error && <p className="text-red-600">{error}</p>}

              {!loading && !error && (
                <Box sx={{ width: '100%'}}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    {/* <Button variant="outlined" sx={{textTransform:'capitalize', ...(isHR || isAdmin && { marginRight: '32rem' })}} onClick={() => setOpenCalculator(true)}>
                      Salary Calculator
                    </Button> */}
                    <Box display="flex" gap={2} alignItems="center">
                      <TextField
                        select
                        label="Month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                      >
                        {months.map((month) => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        label="Year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        size="small"
                        sx={{ width: 120 }}
                      >
                        {years.map((year) => (
                          <MenuItem key={year.value} value={year.value}>
                            {year.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: 'capitalize' }}
                        onClick={handleFilter}
                      >
                        Search
                      </Button>
                    </Box>
                  </Box>

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
             <TextField
              fullWidth
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={notificationData.date}
              onChange={(e) =>
                setNotificationData({
                ...notificationData,
                date: e.target.value,
                })
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon />
                  </InputAdornment>
                ),
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
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Card sx={style}>
        <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          Add Salary
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TextField
          select
          fullWidth
          label="Employee"
          value={salaryForm.user_id}
          onChange={(e) => setSalaryForm({ ...salaryForm, user_id: e.target.value })}
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        >
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Amount"
          type="number"
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CurrencyRupeeIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonthIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          fullWidth
          label="Status"
          value={salaryForm.status}
          onChange={(e) => setSalaryForm({ ...salaryForm, status: e.target.value })}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AssignmentTurnedInIcon />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Paid">Paid</MenuItem>
        </TextField>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="secondary" onClick={() => setOpenAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await axios.post('/salaries/add', salaryForm);
                setOpenAddModal(false);
                setSalaryForm({ user_id: '', amount: '', date: '', status: 'Pending' });
                handleFilter();
              } catch (error) {
                console.error('Add salary error:', error);
                alert('Failed to add salary');
              }
            }}
          >
            Submit
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Modal>
  <Modal open={openCalculator} onClose={() => setOpenCalculator(false)}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 24,
        p: 4,
      }}
    >
      <IconButton
      onClick={() => setOpenCalculator(false)}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        color: (theme) => theme.palette.grey[600],
      }}
    >
      <CloseIcon />
    </IconButton>
      <Typography variant="h6" textAlign="center" gutterBottom> 
        Salary Calculator
      </Typography>

      <TextField
        label="Basic Salary"
        fullWidth
        type="number"
        value={salaryForms.basic_salary}
        onChange={(e) => setSalaryForms({ ...salaryForms, basic_salary: e.target.value })}
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
        label="Bonus"
        fullWidth
        type="number"
        value={salaryForms.bonus}
        onChange={(e) => setSalaryForms({ ...salaryForms, bonus: e.target.value })}
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
        label="Tax %"
        fullWidth
        type="number"
        value={salaryForms.tax_percent}
        onChange={(e) => setSalaryForms({ ...salaryForms, tax_percent: e.target.value })}
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
        label="PF %"
        fullWidth
        type="number"
        value={salaryForms.pf_percent}
        onChange={(e) => setSalaryForms({ ...salaryForms, pf_percent: e.target.value })}
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
        label="Unpaid Leave Days"
        fullWidth
        type="number"
        value={salaryForms.unpaid_leave_days}
        onChange={(e) => setSalaryForms({ ...salaryForms, unpaid_leave_days: e.target.value })}
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
        fullWidth
        variant="contained"
        sx={{ mt: 2, textTransform:'capitalize' }}
        onClick={async () => {
          try {
            const response = await axios.post('/salary/calculate-preview', salaryForms);
            const { net_salary, breakdown } = response.data;
            setSalaryForms((prev) => ({
              ...prev,
              calculated_salary: net_salary,
              breakdown,
            }));
          } catch (error) {
            alert('Calculation failed');
          }
        }}
      >
        Calculate
      </Button>

      {salaryForms.calculated_salary && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Net Salary: ₹{salaryForms.calculated_salary}</Typography>
          <Typography variant="body2">Tax: ₹{salaryForms.breakdown.tax}</Typography>
          <Typography variant="body2">PF: ₹{salaryForms.breakdown.pf}</Typography>
          <Typography variant="body2">Leave Deduction: ₹{salaryForms.breakdown.leaveDeduction}</Typography>
        </Box>
      )}
    </Box>
</Modal>
<Modal open={openSalaryModal} onClose={() => setOpenSalaryModal(false)}>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 500,
      bgcolor: 'background.paper',
      borderRadius: 3,
      boxShadow: 24,
      p: 4,
    }}
  >
    {/* Close Button */}
    <IconButton
      onClick={() => setOpenSalaryModal(false)}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
      }}
    >
      <CloseIcon />
    </IconButton>
    {salaryData?.length > 0 ? (
      <>
        <Typography
          variant="h5"
          sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', color: 'primary.main' }}
        >
          User Salary Detail
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ pl: 1 }}><strong>Name: </strong>{salaryData[0]?.user?.name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ pl: 1 }}><strong>Email: </strong>{salaryData[0]?.user?.email}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ pl: 1 }}><strong>Base Salary: </strong>₹{salaryData[0]?.user?.salary}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ pl: 1 }}><strong>Date: </strong>{salaryData[0].date}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ pl: 1 }}><strong>Bonus: </strong>₹{salaryData[0].bonus}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ pl: 1 }}><strong>Provident Fund: </strong>₹{salaryData[0].providant_fund}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ pl: 1 }}><strong>Leave Deduction: </strong>₹{salaryData[0].leave_deduction}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography
              variant="body1"
              color="success.main"
              fontWeight="bold"
              sx={{ pl: 1 }}
            >
             <strong>Net Salary: </strong> ₹{salaryData[0].net_salary}
            </Typography>
          </Grid>
        </Grid>
      </>
    ) : (
      <Typography textAlign="center">No salary data found.</Typography>
    )}
  </Box>
</Modal>



</AuthenticatedLayout>
  );
}
