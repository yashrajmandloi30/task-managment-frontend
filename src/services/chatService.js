import axiosInstance from './axiosInstance';

// ✅ Get group messages
export const getGroupMessages = async (groupId, page = 1) => {
  const response = await axiosInstance.get(`/chat/group/${groupId}?page=${page}`);
  return response.data;
};

// ✅ Get personal messages
export const getPersonalMessages = async (userId, page = 1) => {
  const response = await axiosInstance.get(`/chat/personal/${userId}?page=${page}`);
  return response.data;
};

// ✅ Get all conversations
export const getConversations = async () => {
  const response = await axiosInstance.get('/chat/conversations');
  return response.data;
};

// ✅ Send message (unified)
export const sendMessage = async (formData) => {
  const response = await axiosInstance.post('/chat', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ✅ Mark messages as read
export const markAsRead = async (groupId) => {
  const response = await axiosInstance.put('/chat/read', { groupId });
  return response.data;
};

// ✅ Delete message
export const deleteMessage = async (messageId) => {
  const response = await axiosInstance.delete(`/chat/${messageId}`);
  return response.data;
};