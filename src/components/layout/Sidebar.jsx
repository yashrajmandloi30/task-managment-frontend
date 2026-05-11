import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { toggleSidebar, closeSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  // ✅ ALL HOOKS MUST BE CALLED AT THE TOP - before any conditional returns
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { groups } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        dispatch(toggleSidebar());
      }
      if (mobile && sidebarOpen) {
        dispatch(closeSidebar());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, sidebarOpen]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      dispatch(closeSidebar());
    }
  }, [location, isMobile, sidebarOpen, dispatch]);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/groups', icon: Users, label: 'Groups' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    window.location.href = '/login';
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      dispatch(closeSidebar());
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
      >
        <Menu size={24} className="text-gray-600" />
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => dispatch(closeSidebar())}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-72' : 'lg:w-20 w-72'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              {sidebarOpen && (
                <>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    TaskManager
                  </h1>
                </>
              )}
            </div>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? (
                isMobile ? <X size={20} /> : <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleCloseSidebar}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `
                }
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                {!sidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}

            {/* Groups Section */}
            {groups && groups.length > 0 && (
              <div className="pt-4 mt-4 border-t">
                {sidebarOpen && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    Your Groups
                  </p>
                )}
                <div className="space-y-1">
                  {groups.map((group) => (
                    <NavLink
                      key={group._id}
                      to={`/group-chat/${group._id}`}
                      onClick={handleCloseSidebar}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                          ${isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                          ${!sidebarOpen && 'justify-center'}
                        `
                      }
                      title={!sidebarOpen ? group.name : ''}
                    >
                      <MessageSquare size={20} className="flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm truncate">{group.name}</span>}
                      {!sidebarOpen && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {group.name}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            {sidebarOpen && user && (
              <div className="mb-3 px-2 py-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Logged in as</p>
                <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group
                ${!sidebarOpen && 'justify-center'}
              `}
              title={!sidebarOpen ? 'Logout' : ''}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;