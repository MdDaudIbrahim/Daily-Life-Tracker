import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, Plus, MessageSquare, ChevronRight } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

const Chat = () => {
  // Load chats from localStorage
  const [chats, setChats] = useState<Chat[]>(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      return JSON.parse(savedChats);
    }
    const initialChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{ 
        id: 1, 
        text: 'Hello! How can I help you today?', 
        sender: 'bot',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };
    return [initialChat];
  });

  const [currentChatId, setCurrentChatId] = useState<string>(chats[0]?.id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        id: 1,
        text: 'Hello! How can I help you today?',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(chats[0]?.id);
    }
  };

  const clearCurrentChat = () => {
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? {
            ...chat,
            messages: [{
              id: Date.now(),
              text: 'Hello! How can I help you today?',
              sender: 'bot',
              timestamp: new Date().toISOString()
            }]
          }
        : chat
    ));
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentChat) return;

    const userMessage: Message = { 
      id: Date.now(), 
      text: input, 
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Update chat with user message
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: input
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

      if (botResponse) {
        // Update chat with bot response
        setChats(prev => prev.map(chat => 
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, {
                  id: Date.now(),
                  text: botResponse,
                  sender: 'bot',
                  timestamp: new Date().toISOString()
                }]
              }
            : chat
        ));

        // Update chat title if it's the first user message
        if (currentChat.messages.length === 1) {
          setChats(prev => prev.map(chat => 
            chat.id === currentChatId
              ? { ...chat, title: input.slice(0, 30) + (input.length > 30 ? '...' : '') }
              : chat
          ));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, {
                id: Date.now(),
                text: 'I apologize, but I encountered an error. Please try again later.',
                sender: 'bot',
                timestamp: new Date().toISOString()
              }]
            }
          : chat
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-2 border-b border-gray-200 flex justify-between items-center">
          <button
            onClick={createNewChat}
            className="flex items-center justify-center space-x-2 px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span className={`${isSidebarOpen ? 'inline' : 'hidden'}`}>New Chat</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronRight size={20} className={`${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${
                chat.id === currentChatId
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <MessageSquare size={18} />
                <div className={`truncate ${isSidebarOpen ? 'block' : 'hidden'}`}>
                  <p className="font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(chat.createdAt)}</p>
                </div>
              </div>
              {chat.id === currentChatId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="p-1 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
          <div className="flex items-center space-x-4">
            <Bot className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">Your personal AI helper</p>
            </div>
          </div>
          <button
            onClick={clearCurrentChat}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Clear current chat"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.timestamp && (
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white shadow-lg">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors shadow-md`}
              disabled={isLoading}
            >
              <Send size={20} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
