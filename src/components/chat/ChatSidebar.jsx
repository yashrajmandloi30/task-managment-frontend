import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageCircle, Users, Search, UserPlus } from 'lucide-react';
import { getAllUsers } from '../../services/authService';

const ChatSidebar = () => {
  const { groups } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New Chat"
          >
            <UserPlus size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showUsers ? (
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-sm font-medium text-gray-600">All Users</h3>
              <button
                onClick={() => setShowUsers(false)}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Back to Groups
              </button>
            </div>
            <div className="space-y-1">
              {filteredUsers.map((u) => (
                <NavLink
                  key={u._id}
                  to={`/private-chat/${u._id}`}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                </NavLink>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No users found</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-sm font-medium text-gray-600">Groups</h3>
              <button
                onClick={() => setShowUsers(true)}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                New Chat
              </button>
            </div>
            <div className="space-y-1">
              {groups.map((group) => (
                <NavLink
                  key={group._id}
                  to={`/group-chat/${group._id}`}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.participants?.length || 0} members</p>
                  </div>
                </NavLink>
              ))}
              {groups.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No groups yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;