// src/services/groupService.js
import axiosInstance from './axiosInstance';

export const getGroups = async () => {
  const response = await axiosInstance.get('/api/group');
  // ✅ If response is already the array, return it directly
  // If it's wrapped in apiResponse, extract data
  if (response.data && Array.isArray(response.data)) {
    return { data: response.data };
  }
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    return { data: response.data.data };
  }
  return { data: response.data || [] };
};

export const createGroup = async (groupData) => {
  const response = await axiosInstance.post('/api/group', groupData);
  if (response.data && response.data.data) {
    return { data: response.data.data };
  }
  return response;
};

export const updateGroup = async (id, groupData) => {
  const response = await axiosInstance.patch(`/api/group/${id}`, groupData);
  if (response.data && response.data.data) {
    return { data: response.data.data };
  }
  return response;
};

export const deleteGroup = async (id) => {
  const response = await axiosInstance.delete(`/api/group/${id}`);
  return response;
};