import React from 'react';
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
    Stack,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { Link, usePage } from '@inertiajs/react';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationsList = ({ notifications = [], onClose }) => {
     const { auth } = usePage().props;
     const user = auth.user;
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
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ flex: 1, textAlign: 'center', color: 'primary.main' }}
                >
                   {(user.user_role == 'admin' || user.user_role == 'hr' ) ? 'Inquiry Messages': 'Notifications' }
                </Typography>
                <IconButton edge="end" onClick={onClose} sx={{ ml: 1 }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {notifications.length === 0 ? (
                <Typography textAlign="center" color="text.secondary">
                   {(user.user_role == 'admin' || user.user_role == 'hr' ) ?  'No new inquiry message':'No new notifications'}
                </Typography>
            ) : (
                <List>
                   {[...notifications]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
                    .map((notification, index) => (
                        <React.Fragment key={notification.id || index}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <NotificationsActiveIcon />
                            </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                            primary={
                                user.user_role === 'employee' ? (
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                    You Received this message from {notification.hr?.name} ({notification.hr?.user_role})
                                </Typography>
                                ) : (
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                    You Received this message from {notification?.user.name}
                                </Typography>
                                )
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
                                </>
                            }
                            />
                        </ListItem>
                        {index !== notifications.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                        </React.Fragment>
                    ))}

                </List>
            )}
        </Paper>
    );
};

export default NotificationsList;
