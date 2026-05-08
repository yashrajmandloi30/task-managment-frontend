// src/components/groups/GroupList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Trash2, Edit, Plus } from 'lucide-react';
import { fetchGroups, deleteGroup } from '../../store/slices/groupSlice';
import { openModal } from '../../store/slices/uiSlice';
import axiosInstance from '../../services/axiosInstance';

const GroupList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groups, loading } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  const [localGroups, setLocalGroups] = useState([]);

  useEffect(() => {
    // Direct API call to verify data
    const loadGroups = async () => {
      try {
        const response = await axiosInstance.get('/group');
        console.log("API Response:", response);
        // Handle different response formats
        let groupsData = [];
        if (Array.isArray(response)) {
          groupsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          groupsData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          groupsData = response.data.data;
        }
        setLocalGroups(groupsData);
      } catch (error) {
        console.error("Error loading groups:", error);
      }
    };
    
    loadGroups();
    dispatch(fetchGroups());
  }, [dispatch]);

  // Use either redux groups or local groups
  const displayGroups = groups?.length > 0 ? groups : localGroups;

  const handleCreateGroup = () => {
    dispatch(openModal({ type: 'createGroup' }));
  };

  const handleEditGroup = (group, e) => {
    e.stopPropagation();
    dispatch(openModal({ type: 'editGroup', data: group }));
  };

  const handleDeleteGroup = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      await dispatch(deleteGroup(id));
      // Refresh groups after delete
      dispatch(fetchGroups());
    }
  };

  if (loading && displayGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Groups</h2>
          <p className="text-gray-500 text-sm mt-1">Create and manage your collaboration groups</p>
        </div>
        <button
          onClick={handleCreateGroup}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Create Group</span>
        </button>
      </div>

      {displayGroups?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Groups Yet</h3>
          <p className="text-gray-500 mb-4">Create your first group to start collaborating with team members</p>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayGroups?.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-primary-200"
              onClick={() => navigate(`/group-chat/${group._id}`)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Users size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{group.name}</h3>
                      <p className="text-xs text-gray-500">
                        {group.participants?.length || 1} member{(group.participants?.length || 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => handleEditGroup(group, e)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600 transition-colors"
                      title="Edit Group"
                    >
                      <Edit size={16} />
                    </button>
                    {group.createdBy === user?._id && (
                      <button
                        onClick={(e) => handleDeleteGroup(group._id, e)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.participants?.slice(0, 4).map((p) => (
                        <div
                          key={p.user?._id}
                          className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white"
                          title={p.user?.name}
                        >
                          <span className="text-xs font-medium text-gray-600">
                            {p.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {group.participants?.length > 4 && (
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-xs text-gray-500">+{group.participants.length - 4}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/group-chat/${group._id}`);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-sm text-primary-600"
                    >
                      <MessageCircle size={14} />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;