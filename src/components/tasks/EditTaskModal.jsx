// src/components/tasks/EditTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import Select from 'react-select';
import { X, Calendar, Flag, Trash2 } from 'lucide-react';
import { updateTask, deleteTask } from '../../store/slices/taskSlice';
import { closeModal } from '../../store/slices/uiSlice';
import { getAllUsers } from '../../services/authService';

Modal.setAppElement('#root');

const EditTaskModal = () => {
  const dispatch = useDispatch();
  const { modalOpen, modalType, modalData } = useSelector((state) => state.ui);
  const { groups } = useSelector((state) => state.groups);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ✅ Only show when modalType is 'editTask'
  const isOpen = modalOpen && modalType === 'editTask';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    type: 'personal',
    groupId: '',
    assignedTo: [],
    deadline: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (modalData) {
      setFormData({
        title: modalData.title || '',
        description: modalData.description || '',
        priority: modalData.priority || 'medium',
        status: modalData.status || 'pending',
        type: modalData.type || 'personal',
        groupId: modalData.groupId || '',
        assignedTo: modalData.assignedTo?.map(u => u._id) || [],
        deadline: modalData.deadline?.split('T')[0] || '',
      });
    }
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter task title');
      return;
    }
    
    setLoading(true);
    try {
      await dispatch(updateTask({ id: modalData._id, data: formData })).unwrap();
      dispatch(closeModal());
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.message || 'Error updating task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      setLoading(true);
      try {
        await dispatch(deleteTask(modalData._id)).unwrap();
        dispatch(closeModal());
      } catch (error) {
        console.error('Error deleting task:', error);
        alert(error.message || 'Error deleting task');
      } finally {
        setLoading(false);
      }
    }
  };

  const userOptions = users.map(user => ({
    value: user._id,
    label: `${user.name} (${user.email})`,
  }));

  const groupOptions = groups?.map(group => ({
    value: group._id,
    label: group.name,
  }));

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'review', label: 'Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => dispatch(closeModal())}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Flag size={18} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold">Edit Task</h2>
          </div>
          <button 
            onClick={() => dispatch(closeModal())} 
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="flex space-x-2">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: option.value })}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                      formData.priority === option.value
                        ? `${option.color} border-transparent ring-2 ring-primary-500`
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'personal', groupId: '' })}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                    formData.type === 'personal'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span>Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'group' })}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                    formData.type === 'group'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span>Group</span>
                </button>
              </div>
            </div>

            {/* Group Selection */}
            {formData.type === 'group' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <Select
                  options={groupOptions}
                  value={groupOptions.find(opt => opt.value === formData.groupId)}
                  onChange={(option) => setFormData({ ...formData, groupId: option?.value || '' })}
                  placeholder="Select a group..."
                />
              </div>
            )}

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <Select
                isMulti
                options={userOptions}
                value={userOptions.filter(opt => formData.assignedTo.includes(opt.value))}
                onChange={(options) => setFormData({ ...formData, assignedTo: options.map(opt => opt.value) })}
                placeholder="Select users to assign..."
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => dispatch(closeModal())}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Task</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditTaskModal;