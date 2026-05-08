import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TaskBoardPage from './pages/TaskBoardPage';
import GroupChatPage from './pages/GroupChatPage';
import PrivateChatPage from './pages/PrivateChatPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GroupsPage from './pages/GroupPage';
import { initSocket, disconnectSocket } from './store/socket';
import { checkAuth } from './store/slices/authSlice';

function App() {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      initSocket(dispatch, user._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user, dispatch]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskBoardPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/group-chat/:groupId" element={<GroupChatPage />} />
        <Route path="/private-chat/:userId" element={<PrivateChatPage />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

export default App;