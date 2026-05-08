import { useDispatch } from 'react-redux';
import { updateTaskStatus } from '../store/slices/taskSlice';

export const useDragDrop = () => {
  const dispatch = useDispatch();

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    await dispatch(updateTaskStatus({ id: draggableId, status: newStatus }));
  };

  return { handleDragEnd };
};