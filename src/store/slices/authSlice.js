import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';
import axiosInstance from '../../services/axiosInstance'; // ✅ import missing
import toast from 'react-hot-toast';

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr && userStr !== 'undefined' && userStr !== 'null') {
      const user = JSON.parse(userStr);
      if (user && user._id) {
        return { user, token, isAuthenticated: true, loading: false, usersList: [], usersLoading: false };
      }
    }
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { user: null, token: null, isAuthenticated: false, loading: false, usersList: [], usersLoading: false };
};

const initialState = {
  ...loadFromStorage(),
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    toast.success('Login successful!');
    return { token, user };
  } catch (error) {
    const msg = error.response?.data?.message || 'Login failed';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const fetchAllUsers = createAsyncThunk('auth/fetchAllUsers', async () => {
  const response = await axiosInstance.get('/user/users');
  return response.data.data;
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    toast.success('Registration successful!');
    return { token, user };
  } catch (error) {
    const msg = error.response?.data?.message || 'Registration failed';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  if (!token) return rejectWithValue('No token');
  try {
    const response = await authService.getCurrentUser();
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return rejectWithValue('Invalid token');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      toast.success('Logged out');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkAuth.pending, (state) => { state.loading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // ✅ Users fetch
      .addCase(fetchAllUsers.pending, (state) => { state.usersLoading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.usersList = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state) => {
        state.usersLoading = false;
        state.usersList = [];
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;