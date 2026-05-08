import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllUsers } from '../services/authService';
import ChatWindow from '../components/chat/ChatWindow';
import { useSelector } from 'react-redux';

const PrivateChatPage = () => {
  const { userId } = useParams();
  const [otherUser, setOtherUser] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        const foundUser = response.data.find(u => u._id === userId);
        setOtherUser(foundUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUsers();
  }, [userId]);

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Chat with {otherUser.name}</h1>
        <p className="text-gray-600">Private Chat</p>
      </div>
      <div className="h-full">
        <ChatWindow chatId={`private_${userId}`} chatType="private" />
      </div>
    </div>
  );
};

export default PrivateChatPage;