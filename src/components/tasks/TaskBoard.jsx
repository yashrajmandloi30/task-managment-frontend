import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plus } from 'lucide-react';
import { deleteTask, fetchTasks, updateTaskStatus } from '../../store/slices/taskSlice';
import TaskColumn from './TaskColumn';
import TaskFilters from './TaskFilters';
import { openModal } from '../../store/slices/uiSlice';
import CreateTaskModal from './CreateTaskModal';

const TaskBoard = () => {
  const dispatch = useDispatch();
  const { tasks = [], loading, filters } = useSelector((state) => state.tasks) || {};
  const { user } = useSelector((state) => state.auth) || {};
  const currentUserRole = user?.role;
  const currentUserId = user?._id;

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleDrop = (taskId, newStatus) => {
    if (!taskId) return;
    dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this task?')) {
      dispatch(deleteTask(taskId));
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = safeTasks.filter(task => {
    if (!task) return false;
    if (filters?.status && filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters?.priority && filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  });

  const columns = {
    pending: filteredTasks.filter(t => t?.status === 'pending'),
    'in-progress': filteredTasks.filter(t => t?.status === 'in-progress'),
    review: filteredTasks.filter(t => t?.status === 'review'),
    completed: filteredTasks.filter(t => t?.status === 'completed'),
  };

  const columnTitles = {
    pending: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    completed: 'Completed',
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading tasks...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Task Board</h2>
          <button
            onClick={() => dispatch(openModal({ type: 'createTask' }))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus size={20} /> Create Task
          </button>
        </div>
        <TaskFilters />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([status, colTasks]) => (
            <TaskColumn
              key={status}
              title={columnTitles[status]}
              status={status}
              tasks={colTasks}
              onDrop={handleDrop}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              onEditTask={(task) => dispatch(openModal({ type: 'editTask', data: task }))}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
        <CreateTaskModal />
      </div>
    </DndProvider>
  );
};

export default TaskBoard;