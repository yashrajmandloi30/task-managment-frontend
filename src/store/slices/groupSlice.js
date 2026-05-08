// src/store/slices/groupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as groupService from '../../services/groupService';
import toast from 'react-hot-toast';

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupService.getGroups();
      console.log("Fetched groups:", response.data); // Debug log
      // ✅ Handle both array and object responses
      const groupsData = Array.isArray(response.data) ? response.data : [];
      return groupsData;
    } catch (error) {
      console.error("Fetch groups error:", error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await groupService.createGroup(groupData);
      toast.success('Group created successfully');
      return response.data;
    } catch (error) {
      console.error("Create group error:", error);
      toast.error(error.response?.data?.message || 'Failed to create group');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await groupService.updateGroup(id, data);
      toast.success('Group updated successfully');
      return response.data;
    } catch (error) {
      console.error("Update group error:", error);
      toast.error(error.response?.data?.message || 'Failed to update group');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (id, { rejectWithValue }) => {
    try {
      await groupService.deleteGroup(id);
      toast.success('Group deleted successfully');
      return id;
    } catch (error) {
      console.error("Delete group error:", error);
      toast.error(error.response?.data?.message || 'Failed to delete group');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearGroups: (state) => {
      state.groups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload || [];
        console.log("Groups set in state:", state.groups); // Debug log
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.groups = [];
      })
      // Create Group
      .addCase(createGroup.fulfilled, (state, action) => {
        if (action.payload) {
          state.groups.push(action.payload);
        }
      })
      // Update Group
      .addCase(updateGroup.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.groups.findIndex(g => g._id === action.payload._id);
          if (index !== -1) {
            state.groups[index] = action.payload;
          }
        }
      })
      // Delete Group
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g._id !== action.payload);
      });
  },
});

export const { clearGroups } = groupSlice.actions;
export default groupSlice.reducer;