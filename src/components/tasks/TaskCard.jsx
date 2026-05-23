import React from 'react';
import { useDrag } from 'react-dnd';
import { Calendar, Flag, Users, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const TaskCard = ({ task, onEdit, onDelete, currentUserRole }) => {
  const isDeadlinePassed = task.deadline && new Date(task.deadline) < new Date();
  const isAdmin = currentUserRole === 'admin';

  // Determine if this task can be dragged
  const canDrag = () => {
    // 1. Completed tasks are never draggable
    if (task.status === 'completed') return false;
    
    // 2. If deadline passed, cannot drag (unless already completed - already filtered)
    if (isDeadlinePassed) return false;
   
    if (!isAdmin) {
      // Non-admin can only drag tasks that are assigned to them
      const isAssigned = task.assignedTo?.some(u => u._id === currentUserRole?._id); // Need actual user id
      if (!isAssigned) return false;
      // Non-admin cannot drag from review or completed (already completed filtered)
      if (task.status === 'review') return false;
    }
    return true;
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task._id, status: task.status },
    canDrag: canDrag(),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const isExpired = isDeadlinePassed && task.status !== 'completed';

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg shadow-sm p-4 cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isExpired ? 'border-2 border-red-500' : 'border border-gray-200'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 line-clamp-2">{task.title}</h4>
        {isAdmin && (
          <div className="flex gap-1 ml-2">
            <button onClick={() => onEdit(task)} className="p-1 hover:bg-gray-100 rounded">
              <Edit2 size={14} className="text-gray-500" />
            </button>
            <button onClick={() => onDelete(task._id)} className="p-1 hover:bg-red-100 rounded">
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        )}
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
          <Flag size={12} className="inline mr-1" />
          {task.priority}
        </span>
        {task.assignedTo?.length > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
            <Users size={12} className="inline mr-1" />
            {task.assignedTo.length}
          </span>
        )}
      </div>
      {task.deadline && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <Calendar size={12} className="mr-1" />
          {format(new Date(task.deadline), 'MMM dd, yyyy')}
        </div>
      )}
      {isExpired && (
        <p className="text-xs text-red-500 mt-2">⚠️ Deadline passed – cannot move</p>
      )}
      {task.status === 'completed' && (
        <p className="text-xs text-green-600 mt-2">✓ Completed – locked</p>
      )}
    </div>
  );
};

export default TaskCard;