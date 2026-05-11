import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import CreateGroupModal from '../groups/CreateGroupModal';
import CreateTaskModal from '../tasks/CreateTaskModal';
import EditTaskModal from '../tasks/EditTaskModal';

const Layout = ({ children }) => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  // Add body class to prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}
        `}
      >
        <Header />
        <main className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <CreateGroupModal />
      <CreateTaskModal />
      <EditTaskModal />
    </div>
  );
};

export default Layout;