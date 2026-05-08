import { format, formatDistance, formatRelative, subDays } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
};

export const formatRelativeTime = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const isOverdue = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};