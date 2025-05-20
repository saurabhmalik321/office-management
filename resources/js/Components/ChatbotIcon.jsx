import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatBot from '../Pages/ChatBot';

const ChatbotIcon = () => {
    const [showChatBot, setShowChatBot] = useState(false);

    const handleClick = () => {
        setShowChatBot(true);
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                {!showChatBot && <div className="mb-2 bg-white text-blue-800 px-4 py-2 rounded-lg shadow-md border border-gray-200 max-w-xs flex items-center gap-1">
                    Hey! Ask me anything
                    <span className="animate-wave origin-[70%_70%] inline-block">👋</span>
                </div> }

                <button
                    onClick={handleClick}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
                    aria-label="Open Chatbot"
                >
                    <MessageCircle size={30} />
                </button>
            </div>

            {showChatBot && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-center"
                    onClick={() => setShowChatBot(false)}
                >
                    <div
                        className="relative bg-white rounded-xl shadow-lg w-full max-w-3xl h-[600px] p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowChatBot(false)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>
                        <ChatBot />
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotIcon;
