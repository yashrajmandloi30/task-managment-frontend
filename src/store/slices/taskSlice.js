// src/store/slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskService from '../../services/taskService';
import toast from 'react-hot-toast';

// Helper to extract error message
const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

// Fetch tasks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks();
      // Ensure response.data.data is an array
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      const newTask = response.data?.data;
      if (!newTask || !newTask._id) {
        throw new Error('Invalid response from server');
      }
      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, data);
      toast.success('Task updated successfully');
      return response.data?.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Update status (drag & drop)
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // Ensure id is string, not object
      const taskId = typeof id === 'string' ? id : id?._id || String(id);
      const response = await taskService.updateTaskStatus(taskId, status);
      return response.data?.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted');
      return id;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Reorder tasks (optional)
export const reorderTasks = createAsyncThunk(
  'tasks/reorderTasks',
  async (tasks, { rejectWithValue }) => {
    try {
      await taskService.reorderTasks(tasks);
      return tasks;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
    filters: { status: 'all', priority: 'all' },
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
        } else {
          console.warn('createTask.fulfilled received invalid payload', action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          const idx = state.tasks.findIndex(t => t._id === action.payload._id);
          if (idx !== -1) state.tasks[idx] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          const idx = state.tasks.findIndex(t => t._id === action.payload._id);
          if (idx !== -1) state.tasks[idx] = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reorder
      .addCase(reorderTasks.fulfilled, (state, action) => {
        const taskIds = action.payload;
        taskIds.forEach((id, idx) => {
          const task = state.tasks.find(t => t._id === id);
          if (task) task.order = idx;
        });
        state.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      });
  },
});

export const { setFilters, clearFilters, updateTaskStatusLocally } = taskSlice.actions;
export default taskSlice.reducer;