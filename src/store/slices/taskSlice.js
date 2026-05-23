// src/store/slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskService from '../../services/taskService';
import toast from 'react-hot-toast';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks();
      // ✅ ensure response.data.data is array
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      // ✅ response.data.data should be the new task object
      const newTask = response.data?.data;
      if (!newTask) throw new Error('No task data received');
      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, data);
      toast.success('Task updated successfully');
      return response.data?.data;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTaskStatus(id, status);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const reorderTasks = createAsyncThunk(
  'tasks/reorderTasks',
  async (tasks, { rejectWithValue }) => {
    try {
      await taskService.reorderTasks(tasks);
      return tasks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],        // ✅ always array
    loading: false,
    error: null,
    filters: {
      status: 'all',
      priority: 'all',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: 'all', priority: 'all' };
    },
    updateTaskStatusLocally: (state, action) => {
      const { id, status } = action.payload;
      const task = state.tasks.find(t => t._id === id);
      if (task) task.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.tasks = [];
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          state.tasks.push(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          const index = state.tasks.findIndex(t => t._id === action.payload._id);
          if (index !== -1) state.tasks[index] = action.payload;
        }
      })
      // Update status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          const index = state.tasks.findIndex(t => t._id === action.payload._id);
          if (index !== -1) state.tasks[index] = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      })
      // Reorder tasks
      .addCase(reorderTasks.fulfilled, (state, action) => {
        const taskIds = action.payload;
        taskIds.forEach((taskId, idx) => {
          const task = state.tasks.find(t => t._id === taskId);
          if (task) task.order = idx;
        });
        state.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      });
  },
});

export const { setFilters, clearFilters, updateTaskStatusLocally } = taskSlice.actions;
export default taskSlice.reducer;