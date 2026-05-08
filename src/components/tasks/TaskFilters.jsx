import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../store/slices/taskSlice';

const TaskFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.tasks);

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={filters.status}
          onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All</option>
          <option value="pending">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Priority:</label>
        <select
          value={filters.priority}
          onChange={(e) => dispatch(setFilters({ priority: e.target.value }))}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {(filters.status !== 'all' || filters.priority !== 'all') && (
        <button
          onClick={() => dispatch(clearFilters())}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default TaskFilters;