// src/pages/GroupPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GroupList from '../components/groups/GroupList';
import { fetchGroups } from '../store/slices/groupSlice';
import CreateGroupModal from '../components/groups/CreateGroupModal';

const GroupsPage = () => {
  const dispatch = useDispatch();
  const { groups, loading } = useSelector((state) => state.groups);

  useEffect(() => {
    if (groups.length === 0 && !loading) {
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length, loading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <GroupList />
      <CreateGroupModal />
    </div>
  );
};

export default GroupsPage;