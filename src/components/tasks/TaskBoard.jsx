// src/pages/TaskBoard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plus } from 'lucide-react';
import { fetchTasks } from '../../store/slices/taskSlice';
import { deleteTask, updateTaskStatus } from '../../services/taskService';
import { openModal } from '../../store/slices/uiSlice';
import TaskFilters from './TaskFilters';
import TaskColumn from './TaskColumn';
import CreateTaskModal from './CreateTaskModal';

const TaskBoard = () => {
  const dispatch = useDispatch();
  const { tasks = [], loading, filters } = useSelector((state) => state.tasks) || {};
  const { user } = useSelector((state) => state.auth) || {};
  const currentUserRole = user?.role;

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleDrop = async (taskId, newStatus) => {
    try {
      await dispatch(updateTaskStatus({ id: taskId, status: newStatus })).unwrap();
    } catch (err) {
      console.error('Drop failed:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  // ✅ Safe filtering – tasks is guaranteed to be array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = safeTasks.filter((task) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
          <button
            onClick={() => dispatch(openModal({ type: 'createTask' }))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Task</span>
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