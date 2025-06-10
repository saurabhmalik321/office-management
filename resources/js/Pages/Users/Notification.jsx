import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { usePage } from '@inertiajs/react';
import relativeTime from 'dayjs/plugin/relativeTime';
import axios from 'axios';
import { styled } from '@mui/system';

dayjs.extend(relativeTime);

// Styled ListItem with animation class
const AnimatedListItem = styled(ListItem)(({ theme }) => ({
  transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
  '&.fade-out': {
    transform: 'translateX(-100%)',
    opacity: 0,
  },
}));

const NotificationsList = ({ notifications = [], onClose, setNotifications }) => {
  const { auth } = usePage().props;
  const user = auth.user;

  const [deletingId, setDeletingId] = useState(null);
  const [visible, setVisible] = useState(
    notifications.reduce((acc, n) => {
      acc[n.id] = true;
      return acc;
    }, {})
  );

  const handleDelete = (id) => {
    setDeletingId(id); // Mark for animation
    setTimeout(() => {
      // Collapse after animation
      setVisible(prev => ({ ...prev, [id]: false }));

      // Remove from state after collapse
      setTimeout(() => {
        const route = user.user_role === 'admin' || user.user_role === 'hr' ? '/inquiries' : '/notifications';
        console.log(route, 'test meeee')
        axios
          .delete(`${route}/${id}`)
          .then(() => {
            setNotifications(prev => prev.filter(item => item.id !== id));
          })
          .catch((error) => {
            console.error(`Error deleting ${user.user_role === 'admin' || user.user_role === 'hr' ? 'inquiry' : 'notification'}:`, error);
          });
      }, 300); // Collapse duration
    }, 400); // Wait for fade-out
  };

  return (
    <Paper
      elevation={6}
      sx={{
        width: 520,
        maxHeight: 600,
        overflowY: 'auto',
        p: 3,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        borderRadius: 3,
        boxShadow: 10,
        backgroundColor: 'white',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ flex: 1, textAlign: 'center', color: 'primary.main' }}
        >
          {user.user_role === 'admin' || user.user_role === 'hr' ? 'Inquiry Messages' : 'Notifications'}
        </Typography>
        <IconButton edge="end" onClick={onClose} sx={{ ml: 1 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {notifications.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          {user.user_role === 'admin' || user.user_role === 'hr' ? 'No new inquiry messages' : 'No new notifications'}
        </Typography>
      ) : (
        <List>
          {[...notifications]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((notification, index) => (
              <Collapse
                key={notification.id}
                in={visible[notification.id]}
                timeout={300}
              >
                <AnimatedListItem
                  alignItems="flex-start"
                  className={deletingId === notification.id ? 'fade-out' : ''}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <NotificationsActiveIcon />
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        You received this {user.user_role === 'admin' || user.user_role === 'hr' ? 'inquiry' : 'notification'} from{' '}
                        {user.user_role === 'employee'
                          ? `${notification.hr?.name} (${notification.hr?.user_role})`
                          : notification?.user?.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        {user.user_role === 'employee' && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Title:</strong> {notification.title || 'No Title'}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                          <strong>Message:</strong> {notification.message || 'No Message'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {dayjs(notification.created_at).fromNow()}
                        </Typography>

                        <Box display="flex" justifyContent="flex-end" mt={1}>
                            <IconButton
                              onClick={() => handleDelete(notification.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                        </Box>
                      </>
                    }
                  />
                </AnimatedListItem>
                {index !== notifications.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
              </Collapse>
            ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationsList;
