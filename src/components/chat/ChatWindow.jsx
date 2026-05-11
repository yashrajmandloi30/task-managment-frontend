import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Paperclip, X, File, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sendMessage, fetchMessages, markMessagesAsRead } from '../../store/slices/chatSlice';
import { joinGroupChat, joinPersonalChat } from '../../store/socket';

const ChatWindow = ({ chatId, chatType }) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { messages, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const chatMessages = messages && messages[chatId] ? messages[chatId] : [];
  useEffect(() => {
    if (chatId && chatType) {
      if (chatType === 'group') {
        joinGroupChat(chatId);
      } else {
        joinPersonalChat(chatId);
      }
    }
  }, [chatId, chatType]);
  useEffect(() => {
    if (chatId && chatType) {
      dispatch(fetchMessages({ chatId, chatType }));
      if (chatType === 'group') {
        dispatch(markMessagesAsRead({ groupId: chatId }));
      }
    }
  }, [dispatch, chatId, chatType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !file) return;

    await dispatch(sendMessage({
      chatId,
      chatType,
      message: message.trim(),
      file,
    }));

    setMessage('');
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderFilePreview = (msg) => {
    if (!msg.fileUrl) return null;

    const fileUrl = msg.fileUrl.startsWith('http') 
      ? msg.fileUrl 
      : `${import.meta.env.VITE_API_URL}${msg.fileUrl}`;

    if (msg.fileType === 'image') {
      return (
        <div className="mt-2">
          <img
            src={fileUrl}
            alt={msg.fileName}
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(fileUrl, '_blank')}
          />
        </div>
      );
    } else if (msg.fileType === 'video') {
      return (
        <div className="mt-2">
          <video src={fileUrl} controls className="max-w-xs rounded-lg" />
        </div>
      );
    } else if (msg.fileType === 'document') {
      return (
        <div className="mt-2 flex items-center space-x-2 text-blue-600">
          <File size={20} />
          <a href={fileUrl} download={msg.fileName} className="text-sm hover:underline">
            {msg.fileName}
          </a>
        </div>
      );
    }
    return null;
  };

  if (loading && chatMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
            <p className="text-sm text-gray-500 mt-1">Start a conversation! 👋</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3 shadow-sm`}>
                  {!isOwn && msg.sender && (
                    <p className="text-xs font-medium mb-1 text-blue-600">
                      {msg.sender.name}
                    </p>
                  )}
                  {msg.message && (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  )}
                  {renderFilePreview(msg)}
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {filePreview && (
        <div className="border-t p-2 bg-gray-50">
          <div className="relative inline-block">
            {file.type.startsWith('image/') ? (
              <img src={filePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
            ) : file.type.startsWith('video/') ? (
              <video src={filePreview} className="h-20 w-20 object-cover rounded" />
            ) : (
              <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                <File size={32} className="text-gray-500" />
              </div>
            )}
            <button
              onClick={() => {
                setFile(null);
                setFilePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="1"
            style={{ minHeight: '40px', maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() && !file}
            className="p-2 bg-green-700 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;