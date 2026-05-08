// src/components/layout/Layout.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import CreateGroupModal from '../groups/CreateGroupModal';
import CreateTaskModal from '../tasks/CreateTaskModal';
import EditTaskModal from '../tasks/EditTaskModal';

const Layout = ({ children }) => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={`${sidebarOpen ? 'lg:pl-64' : ''} transition-all duration-300`}>
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* Modals - Each checks its own modalType */}
      <CreateGroupModal />
      <CreateTaskModal />
      <EditTaskModal />
    </div>
  );
};

export default Layout;