import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
      const callbacks = this.listeners.get(event) || [];
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  emit(event, ...args) {
    if (!this.socket) return;
    this.socket.emit(event, ...args);
  }

  sendPrivateMessage(userId, message) {
    this.emit('private-message', userId, message);
  }

  sendGroupMessage(groupId, message) {
    this.emit('group-message', groupId, message);
  }

  joinGroup(groupId) {
    this.emit('joinGroup', groupId);
  }

  joinUser(userId) {
    this.emit('join', userId);
  }
}

export default new SocketService();