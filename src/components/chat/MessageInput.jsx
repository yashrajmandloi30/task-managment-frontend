import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Video, File } from 'lucide-react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !file) return;
    onSendMessage(message.trim(), file);
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

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return <ImageIcon size={16} />;
    if (file.type.startsWith('video/')) return <Video size={16} />;
    return <File size={16} />;
  };

  return (
    <div className="border-t bg-white p-4">
      {filePreview && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg inline-flex items-center space-x-2">
          {file.type.startsWith('image/') ? (
            <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
          ) : file.type.startsWith('video/') ? (
            <video src={filePreview} className="h-12 w-12 object-cover rounded" />
          ) : (
            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
          <span className="text-sm text-gray-600 max-w-[150px] truncate">{file.name}</span>
          <button
            onClick={() => {
              setFile(null);
              setFilePreview(null);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex items-end space-x-2">
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
          disabled={disabled}
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
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !file) || disabled}
          className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;