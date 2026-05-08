import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { File, Image as ImageIcon, Video } from 'lucide-react';

const MessageList = ({ messages, loading }) => {
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderFilePreview = (msg) => {
    if (!msg.fileUrl) return null;

    if (msg.fileType === 'image') {
      return (
        <div className="mt-2">
          <img
            src={msg.fileUrl}
            alt={msg.fileName}
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(msg.fileUrl, '_blank')}
          />
        </div>
      );
    } else if (msg.fileType === 'video') {
      return (
        <div className="mt-2">
          <video src={msg.fileUrl} controls className="max-w-xs rounded-lg" />
        </div>
      );
    } else {
      return (
        <div className="mt-2 flex items-center space-x-2 text-blue-600">
          <File size={16} />
          <a href={msg.fileUrl} download={msg.fileName} className="text-sm hover:underline">
            {msg.fileName}
          </a>
        </div>
      );
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">No messages yet. Say hi! 👋</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isOwn = msg.sender?._id === user?._id;
        return (
          <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${isOwn ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3 shadow-sm`}>
              {!isOwn && msg.sender && (
                <p className="text-xs font-semibold mb-1 text-primary-600">{msg.sender.name}</p>
              )}
              {msg.message && <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>}
              {renderFilePreview(msg)}
              <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;