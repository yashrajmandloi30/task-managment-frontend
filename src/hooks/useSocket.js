import { useEffect, useState } from 'react';
import { getSocket } from '../store/socket';

export const useSocket = (eventName, handler) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    try {
      const socketInstance = getSocket();
      setSocket(socketInstance);
    } catch (error) {
      console.error('Socket not initialized');
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
};