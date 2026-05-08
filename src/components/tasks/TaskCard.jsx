import React from 'react';
import { useDrag } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { Calendar, Flag, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { openModal } from '../../store/slices/uiSlice';
import { deleteTask } from '../../store/slices/taskSlice';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const TaskCard = ({ task }) => {
  const dispatch = useDispatch();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task._id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleEdit = () => {
    dispatch(openModal({ type: 'editTask', data: task }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task._id));
    }
  };

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{task.title}</h4>
        <div className="flex space-x-1">
          <button
            onClick={handleEdit}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit size={14} className="text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Flag size={12} className={priorityColors[task.priority].split(' ')[1]} />
          <span className={`px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {task.deadline && (
          <div className="flex items-center text-gray-500">
            <Calendar size={12} className="mr-1" />
            <span>{format(new Date(task.deadline), 'MMM dd')}</span>
          </div>
        )}
      </div>

      {task.assignedTo?.length > 0 && (
        <div className="mt-3 flex items-center space-x-1">
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user) => (
              <div
                key={user._id}
                className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center border-2 border-white"
                title={user.name}
              >
                <span className="text-xs text-primary-600 font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          {task.assignedTo.length > 3 && (
            <span className="text-xs text-gray-500">
              +{task.assignedTo.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;