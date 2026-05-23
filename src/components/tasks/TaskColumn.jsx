import React from 'react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';

const TaskColumn = ({ title, status, tasks, onDrop, currentUserRole, onEditTask, onDeleteTask }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    canDrop: (item) => {
      // Find the task being dragged
      const task = tasks.find(t => t._id === item.id);
      // If task is completed, prevent dropping anywhere
      if (task?.status === 'completed') return false;
      // If deadline passed and not completed, prevent drop
      if (task?.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed') {
        return false;
      }
      return true;
    },
    drop: (item) => onDrop(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-gray-50 rounded-lg p-4 min-h-[500px] transition-all ${
        isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            currentUserRole={currentUserRole}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;