// src/services/taskService.js
import axiosInstance from "./axiosInstance";

export const getTasks = async () => {
  try {
    const response = await axiosInstance.get("/task");
    return response;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post("/task", taskData);
    return response;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await axiosInstance.patch(`/task/${id}`, taskData);
    return response;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const updateTaskStatus = (id, status) =>
  axiosInstance.patch(`/task/${id}/status`, { status });

export const deleteTask = async (id) => {
  try {
    const response = await axiosInstance.delete(`/task/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const reorderTasks = async (tasks) => {
  try {
    const response = await axiosInstance.post("/task/reorder", { tasks });
    return response;
  } catch (error) {
    console.error("Error reordering tasks:", error);
    throw error;
  }
};