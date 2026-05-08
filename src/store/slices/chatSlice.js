import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as chatService from '../../services/chatService';

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ chatId, chatType, page = 1 }, { rejectWithValue }) => {
    try {
      let response;
      if (chatType === 'group') {
        response = await chatService.getGroupMessages(chatId, page);
      } else {
        response = await chatService.getPersonalMessages(chatId, page);
      }
      return { chatId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, chatType, message, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (chatType === 'group') {
        formData.append('groupId', chatId);
      } else {
        formData.append('receiverId', chatId);
      }
      formData.append('message', message);
      if (file) {
        formData.append('file', file);
      }
      const response = await chatService.sendMessage(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markAsRead',
  async ({ groupId }, { rejectWithValue }) => {
    try {
      await chatService.markAsRead(groupId);
      return { groupId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await chatService.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: {},
    loading: false,
    error: null,
    activeChat: null,
    chatType: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload.id;
      state.chatType = action.payload.type;
    },
    
    // ✅ Add message reducer
    addMessage: (state, action) => {
      const message = action.payload;
      
      // For group messages
      if (message.groupId) {
        if (!state.messages[message.groupId]) {
          state.messages[message.groupId] = [];
        }
        // Check if message already exists (avoid duplicates)
        const exists = state.messages[message.groupId].some(m => m._id === message._id);
        if (!exists) {
          state.messages[message.groupId].unshift(message);
        }
      } 
      // For private messages
      else if (message.conversationId) {
        if (!state.messages[message.conversationId]) {
          state.messages[message.conversationId] = [];
        }
        const exists = state.messages[message.conversationId].some(m => m._id === message._id);
        if (!exists) {
          state.messages[message.conversationId].unshift(message);
        }
      }
      // For sender's own message (receiver case)
      else if (message.receiver) {
        const conversationId = [message.sender?._id, message.receiver?._id].sort().join('_');
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        const exists = state.messages[conversationId].some(m => m._id === message._id);
        if (!exists) {
          state.messages[conversationId].unshift(message);
        }
      }
    },
    
    // ✅ Remove message reducer (for delete functionality)
    removeMessage: (state, action) => {
      const messageId = action.payload;
      Object.keys(state.messages).forEach(chatId => {
        state.messages[chatId] = state.messages[chatId].filter(m => m._id !== messageId);
      });
    },
    
    updateMessageStatus: (state, action) => {
      const { messageId, readBy } = action.payload;
      Object.keys(state.messages).forEach(chatId => {
        const message = state.messages[chatId].find(m => m._id === messageId);
        if (message) {
          message.readBy = readBy;
        }
      });
    },
    
    clearChat: (state) => {
      state.activeChat = null;
      state.chatType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        if (message.groupId) {
          if (!state.messages[message.groupId]) {
            state.messages[message.groupId] = [];
          }
          state.messages[message.groupId].unshift(message);
        } else if (message.conversationId) {
          if (!state.messages[message.conversationId]) {
            state.messages[message.conversationId] = [];
          }
          state.messages[message.conversationId].unshift(message);
        }
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        // Update read status in UI if needed
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.keys(state.messages).forEach(chatId => {
          state.messages[chatId] = state.messages[chatId].filter(m => m._id !== messageId);
        });
      });
  },
});

export const { 
  setActiveChat, 
  addMessage, 
  removeMessage, 
  updateMessageStatus, 
  clearChat 
} = chatSlice.actions;

export default chatSlice.reducer;