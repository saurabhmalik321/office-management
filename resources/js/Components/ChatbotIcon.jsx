import React,{useState} from 'react';
import { MessageCircle } from 'lucide-react'; 
import ChatBot from '../Pages/ChatBot';
const ChatbotIcon = () => {
     const [showChatBot, setShowChatBot] = useState(false);
  const handleClick = () => {
   setShowChatBot(true);
  };

  return (
    <>
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      aria-label="Open Chatbot"
    >
      <MessageCircle size={30}
    />
    </button>
     {showChatBot && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
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
