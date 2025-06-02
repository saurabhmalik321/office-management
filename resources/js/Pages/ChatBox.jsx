import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Box, TextField, MenuItem } from '@mui/material';

export default function ChatBox({ receiverId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ user_id: receiverId || '' });
    const [localErrors, setLocalErrors] = useState({});
    const messagesEndRef = useRef(null);

    const currentUserId = window?.Laravel?.user?.id;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        setMessages([]);
    };

    const fetchUsers = () => {
        axios.get('/employee')
            .then((response) => setUsers(response.data))
            .catch((error) => console.error('Error fetching users:', error));
    };

    const fetchMessages = async () => {
        if (!form.user_id) return;
        try {
            const res = await axios.get(`/messages/${form.user_id}`);
            if (Array.isArray(res.data)) {
                setMessages(res.data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        if (input.trim() === '' || !form.user_id) return;

        const newMessage = {
            id: Date.now(),
            sender_id: currentUserId,
            message: input,
            created_at: new Date().toISOString(),
        };

        // Optimistically update UI
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
        setInput('');

        try {
            await axios.post('/messages', {
                receiver_id: form.user_id,
                message: input,
            });
            fetchMessages(); // refresh from backend (optional)
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (form.user_id) {
            fetchMessages();
        }
    }, [form.user_id]);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Messages</h2>}
        >
            <div className="py-12">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="flex flex-col w-full h-[600px] bg-white border shadow-lg rounded-lg overflow-hidden">

                        {/* Header */}
                        <div className="flex justify-between items-center bg-green-600 text-white px-4 py-3">
                            <div className="font-semibold text-lg">
                                Chat with {users.find(u => u.id === parseInt(form.user_id))?.name || 'Select a User'}
                            </div>
                            <Box className="w-64">
                                <TextField
                                    select
                                    fullWidth
                                    label="Select User"
                                    name="user_id"
                                    value={form.user_id}
                                    onChange={handleChange}
                                    error={!!localErrors.user_id}
                                    helperText={localErrors.user_id}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <MenuItem value="" disabled>Employee Name</MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </div>

                        {/* Message area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {form.user_id && messages.length === 0 && (
                                <p className="text-center text-gray-400 italic">Start the conversation</p>
                            )}

                            {form.user_id && messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] px-4 py-2 rounded-lg text-sm shadow-sm ${
                                        msg.sender_id === currentUserId
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-800'
                                    }`}>
                                        {msg.message}
                                        <div className="text-[10px] text-right mt-1 opacity-70">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input box */}
                        {form.user_id && (
                            <div className="p-3 border-t bg-white flex items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Type your message..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                                >
                                    Send
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
