import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, CheckCircle, Clock, ListTodo, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { fetchTasks } from '../store/slices/taskSlice';
import { fetchGroups } from '../store/slices/groupSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { groups } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchGroups());
  }, [dispatch]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    return deadline >= weekStart && deadline <= weekEnd;
  });

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'bg-blue-500' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.inProgress, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-500' },
  ];

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Groups Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your Groups</h2>
          <Users size={20} className="text-gray-400" />
        </div>
        {groups?.length > 0 ? (
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{group.name}</span>
                <span className="text-sm text-gray-500">{group.participants?.length || 0} members</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No groups yet. Create a group to collaborate!</p>
        )}
      </div>

      {/* This Week's Tasks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">This Week's Deadlines</h2>
        {thisWeekTasks.length > 0 ? (
          <div className="space-y-2">
            {thisWeekTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No tasks with deadlines this week.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;