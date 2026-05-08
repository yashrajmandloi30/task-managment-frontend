import axiosInstance from './axiosInstance';

export const getTasks = async () => {
  const response = await axiosInstance.get('/api/task');
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await axiosInstance.get(`/api/task/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axiosInstance.post('/api/task', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axiosInstance.put(`/api/task/${id}`, taskData);
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/api/task/${id}/status`, { status });
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/api/task/${id}`);
  return response.data;
};

export const reorderTasks = async (tasks) => {
  const response = await axiosInstance.post('/api/task/reorder', { tasks });
  return response.data;
};