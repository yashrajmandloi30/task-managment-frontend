import axiosInstance from './axiosInstance';

export const login = async (credentials) => {
  const response = await axiosInstance.post('/user/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosInstance.post('/user/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/me');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axiosInstance.get('/user/users');
  return response.data;
};