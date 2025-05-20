import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    const response = await axios.post('/chat', { message: input });
    const botMessage = { sender: 'bot', text: response.data.reply };

    setMessages(prev => [...prev, botMessage]);
    setInput('');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">ChatBot</h2>
      <div className="border p-4 h-96 overflow-y-auto rounded bg-white shadow">
        <h6>Ask Only About Company</h6>
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 text-${msg.sender === 'user' ? 'right' : 'left'}`}>
            <span className={`inline-block p-2 rounded ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-grow border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder='Ask Anything Here'
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
