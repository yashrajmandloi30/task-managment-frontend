// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // ✅ Get user from Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setDropdownOpen(false);
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={handleToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>

          {/* Page title placeholder */}
          <div className="flex-1 lg:flex-none">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          </div>

          {/* Right side: user info & dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <div className="text-right hidden sm:block">
                {/* ✅ User name from Redux */}
                <p className="text-sm font-medium text-gray-700">
                  {user?.name || 'Guest'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      // navigate to profile if you have
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <User size={14} /> Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;