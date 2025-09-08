'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatProps {
  messages: string[];
  sendMessage: (message: string) => void;
  currentIdentity: string;
}

const Chat = ({ messages, sendMessage, currentIdentity }: ChatProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect ensures the chat window scrolls to the bottom for new messages.
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const [sender, content] = msg.split(': ', 2);
          const isCurrentUser = sender.trim() === currentIdentity.trim();

          return (
            <div
              key={index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg text-sm break-words shadow-md ${
                  isCurrentUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <span className={`font-semibold mb-1 block ${isCurrentUser ? 'text-gray-100' : 'text-gray-700'}`}>
                  {sender}
                </span>
                {content}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
};

export default Chat;