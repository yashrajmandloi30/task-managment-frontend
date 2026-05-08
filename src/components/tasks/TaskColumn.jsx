import React from 'react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { updateTaskStatus } from '../../store/slices/taskSlice';
import { useDispatch } from 'react-redux';

const TaskColumn = ({ title, status, tasks, onDragEnd }) => {
  const dispatch = useDispatch();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item) => {
      if (item.status !== status) {
        dispatch(updateTaskStatus({ id: item.id, status }));
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-gray-100 rounded-lg p-4 min-h-[500px] transition-colors ${
        isOver ? 'bg-gray-200' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
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