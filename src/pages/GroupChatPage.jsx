// src/pages/GroupChatPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Users } from 'lucide-react';
import ChatWindow from '../components/chat/ChatWindow';
import { fetchGroups } from '../store/slices/groupSlice';

const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { groups, loading: groupsLoading } = useSelector((state) => state.groups);
  const [currentGroup, setCurrentGroup] = useState(null);

  useEffect(() => {
    // Fetch groups if not already loaded
    if (groups.length === 0) {
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length]);

  useEffect(() => {
    // Find the current group from groups array
    if (groups.length > 0 && groupId) {
      const group = groups.find(g => g._id === groupId);
      setCurrentGroup(group);
    }
  }, [groups, groupId]);

  if (groupsLoading && !currentGroup) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentGroup && !groupsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Group Not Found</h2>
          <p className="text-gray-500 mb-4">The group you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => navigate('/groups')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{currentGroup?.name || 'Group Chat'}</h1>
            <p className="text-sm text-gray-500">
              {currentGroup?.participants?.length || 0} members
            </p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {currentGroup?.participants?.slice(0, 5).map((p) => (
            <div
              key={p.user?._id}
              className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border-2 border-white"
              title={p.user?.name}
            >
              <span className="text-xs font-medium text-primary-600">
                {p.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {currentGroup?.participants?.length > 5 && (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-xs text-gray-500">+{currentGroup.participants.length - 5}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <ChatWindow chatId={groupId} chatType="group" />
      </div>
    </div>
  );
};

export default GroupChatPage;