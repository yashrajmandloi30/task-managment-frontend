import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDragDrop } from '../../hooks/useDragAndDrop';
import TaskColumn from './TaskColumn';
import CreateTaskModal from './CreateTaskModal';
import TaskFilters from './TaskFilters';
import { fetchTasks } from '../../store/slices/taskSlice';
import { openModal } from '../../store/slices/uiSlice';
import { Plus } from 'lucide-react';

const TaskBoard = () => {
  const dispatch = useDispatch();
  const { tasks, loading, filters } = useSelector((state) => state.tasks);
  const { handleDragEnd } = useDragDrop();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const filteredTasks = tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  });

  const columns = {
    pending: filteredTasks.filter((t) => t.status === 'pending'),
    'in-progress': filteredTasks.filter((t) => t.status === 'in-progress'),
    review: filteredTasks.filter((t) => t.status === 'review'),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  const columnTitles = {
    pending: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    completed: 'Completed',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
        <button
          onClick={() => dispatch(openModal({ type: 'createTask' }))}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>Create Task</span>
        </button>
      </div>

      <TaskFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(columns).map(([status, columnTasks]) => (
          <TaskColumn
            key={status}
            title={columnTitles[status]}
            status={status}
            tasks={columnTasks}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <CreateTaskModal />
    </div>
  );
};

export default TaskBoard;