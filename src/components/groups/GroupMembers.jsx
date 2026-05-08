import React from 'react';
import { Crown, UserMinus } from 'lucide-react';

const GroupMembers = ({ members, currentUserId, isAdmin, onRemoveMember }) => {
  return (
    <div className="space-y-2">
      {members.map((member) => {
        const memberUser = member.user;
        const isCreator = member.role === 'admin';
        const isCurrentUser = memberUser?._id === currentUserId;

        return (
          <div key={memberUser?._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {memberUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium text-gray-800">{memberUser?.name}</p>
                  {isCreator && (
                    <span className="inline-flex items-center space-x-1 text-xs text-yellow-600">
                      <Crown size={12} />
                      <span>Admin</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{memberUser?.email}</p>
              </div>
            </div>
            {isAdmin && !isCreator && !isCurrentUser && (
              <button
                onClick={() => onRemoveMember?.(memberUser?._id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Remove member"
              >
                <UserMinus size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupMembers;