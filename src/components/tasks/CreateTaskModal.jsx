// src/components/tasks/CreateTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import Select from 'react-select';
import { X, Calendar, Flag } from 'lucide-react';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import { closeModal } from '../../store/slices/uiSlice';
import { getAllUsers } from '../../services/authService';

Modal.setAppElement('#root');

const CreateTaskModal = () => {
  const dispatch = useDispatch();
  const { modalOpen, modalType, modalData } = useSelector((state) => state.ui);
  const { groups } = useSelector((state) => state.groups);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    type: 'personal',
    groupId: null,
    assignedTo: [],
    deadline: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setAllUsers(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  // Pre-fill for edit
  useEffect(() => {
    if (modalOpen && modalType === 'editTask' && modalData) {
      setFormData({
        title: modalData.title || '',
        description: modalData.description || '',
        priority: modalData.priority || 'medium',
        status: modalData.status || 'pending',
        type: modalData.type || 'personal',
        groupId: modalData.groupId?._id || modalData.groupId || null,
        assignedTo: modalData.assignedTo?.map(u => u._id || u) || [],
        deadline: modalData.deadline?.split('T')[0] || '',
      });
    } else if (modalOpen && modalType === 'createTask') {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        type: 'personal',
        groupId: null,
        assignedTo: [],
        deadline: '',
      });
    }
  }, [modalOpen, modalType, modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (formData.type === 'group' && !formData.groupId) {
      alert('Please select a group');
      return;
    }

    // Prepare payload – ensure groupId is null for personal tasks
    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      type: formData.type,
      deadline: formData.deadline || null,
      assignedTo: formData.assignedTo || [],
      groupId: formData.type === 'personal' ? null : formData.groupId,
    };
    // If editing, also include status
    if (modalType === 'editTask') {
      payload.status = formData.status;
    }

    setLoading(true);
    try {
      if (modalType === 'editTask') {
        await dispatch(updateTask({ id: modalData._id, data: payload })).unwrap();
      } else {
        await dispatch(createTask(payload)).unwrap();
      }
      dispatch(closeModal());
    } catch (err) {
      // Error already handled by thunk (toast)
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userOptions = allUsers.map(u => ({ value: u._id, label: `${u.name} (${u.email})` }));
  const groupOptions = groups?.map(g => ({ value: g._id, label: g.name }));

  if (!modalOpen || (modalType !== 'createTask' && modalType !== 'editTask')) return null;

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => dispatch(closeModal())}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{modalType === 'editTask' ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={() => dispatch(closeModal())}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            rows="3"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          {modalType === 'editTask' && (
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          )}
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map(prio => (
              <button
                key={prio}
                type="button"
                onClick={() => setFormData({ ...formData, priority: prio })}
                className={`flex-1 py-2 rounded-lg border ${formData.priority === prio ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
              >
                {prio.charAt(0).toUpperCase() + prio.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'personal', groupId: null, assignedTo: [] })}
              className={`py-2 rounded-lg border ${formData.type === 'personal' ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'group', assignedTo: [] })}
              className={`py-2 rounded-lg border ${formData.type === 'group' ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
            >
              Group
            </button>
          </div>
          {formData.type === 'group' && (
            <Select
              options={groupOptions}
              value={groupOptions?.find(opt => opt.value === formData.groupId)}
              onChange={(opt) => setFormData({ ...formData, groupId: opt?.value || null, assignedTo: [] })}
              placeholder="Select group"
              isClearable
            />
          )}
          <div>
            <Select
              isMulti
              options={userOptions}
              value={userOptions.filter(opt => formData.assignedTo.includes(opt.value))}
              onChange={(opts) => setFormData({ ...formData, assignedTo: opts.map(o => o.value) })}
              placeholder={formData.type === 'group' && !formData.groupId ? 'First select group' : 'Assign to users'}
              isDisabled={formData.type === 'group' && !formData.groupId}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => dispatch(closeModal())} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Saving...' : (modalType === 'editTask' ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;