import io from 'socket.io-client';
import { addMessage, removeMessage, updateMessageStatus } from './slices/chatSlice';
import { updateTaskStatus as updateTaskStatusAction } from './slices/taskSlice';

let socket = null;

export const initSocket = (dispatch, userId) => {
  if (socket?.connected) return socket;

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected successfully');
    socket.emit('authenticate', userId);
    socket.emit('join', userId);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  // ✅ Group message event
  socket.on('new-group-message', (message) => {
    console.log('New group message received:', message);
    dispatch(addMessage(message));
  });

  // ✅ Private message event
  socket.on('new-private-message', (message) => {
    console.log('New private message received:', message);
    dispatch(addMessage(message));
  });

  // ✅ Message sent confirmation
  socket.on('message-sent', (message) => {
    console.log('Message sent confirmation:', message);
    dispatch(addMessage(message));
  });

  // ✅ Message deleted event
  socket.on('message-deleted', (data) => {
    console.log('Message deleted:', data);
    dispatch(removeMessage(data.messageId));
  });

  // ✅ Messages read event
  socket.on('messages-read', (data) => {
    console.log('Messages read:', data);
    // Update read status in UI if needed
  });

  // ✅ Task status updated event
  socket.on('task-status-updated', (task) => {
    console.log('Task status updated:', task);
    dispatch(updateTaskStatusAction(task));
  });

  // ✅ User online/offline events
  socket.on('user-online', ({ userId, status }) => {
    console.log(`User ${userId} is ${status ? 'online' : 'offline'}`);
    // Update online status in UI
  });

  // ✅ User typing events
  socket.on('user-typing', ({ userId, isTyping }) => {
    console.log(`User ${userId} is ${isTyping ? 'typing...' : 'stopped typing'}`);
    // Show typing indicator in UI
  });

  // ✅ Group events
  socket.on('groupCreated', (group) => {
    console.log('New group created:', group);
    // Handle group creation
  });

  socket.on('groupUpdated', (group) => {
    console.log('Group updated:', group);
    // Handle group update
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected manually');
  }
};

// ✅ Send group message
export const sendGroupMessage = (groupId, message, fileInfo = null) => {
  if (socket) {
    socket.emit('send-group-message', { groupId, message, fileInfo }, (response) => {
      if (response?.success) {
        console.log('Group message sent successfully');
      } else {
        console.error('Failed to send group message:', response?.error);
      }
    });
  }
};

// ✅ Send private message
export const sendPrivateMessage = (receiverId, message, fileInfo = null) => {
  if (socket) {
    socket.emit('send-private-message', { receiverId, message, fileInfo }, (response) => {
      if (response?.success) {
        console.log('Private message sent successfully');
      } else {
        console.error('Failed to send private message:', response?.error);
      }
    });
  }
};

// ✅ Join personal chat room
export const joinPersonalChat = (otherUserId) => {
  if (socket) {
    socket.emit('join-personal-chat', otherUserId);
  }
};

// ✅ Join group chat room
export const joinGroupChat = (groupId) => {
  if (socket) {
    socket.emit('joinGroup', groupId);
  }
};

// ✅ Send typing indicator
export const sendTyping = (chatId, chatType, receiverId = null) => {
  if (socket) {
    socket.emit('typing', { chatId, chatType, receiverId });
  }
};

// ✅ Send stop typing indicator
export const sendStopTyping = (chatId, chatType, receiverId = null) => {
  if (socket) {
    socket.emit('stop-typing', { chatId, chatType, receiverId });
  }
};

// ✅ Mark messages as read (via socket)
export const markMessagesRead = (conversationId, chatType) => {
  if (socket) {
    socket.emit('mark-messages-read', { conversationId, chatType });
  }
}; 