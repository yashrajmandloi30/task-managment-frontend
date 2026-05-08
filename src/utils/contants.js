export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
};

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const TASK_TYPES = {
  PERSONAL: 'personal',
  GROUP: 'group',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    GET_USERS: '/user/users',
  },
  TASKS: {
    BASE: '/task',
    REORDER: '/task/reorder',
  },
  GROUPS: {
    BASE: '/group',
  },
  CHAT: {
    BASE: '/chat',
    READ: '/chat/read',
  },
};