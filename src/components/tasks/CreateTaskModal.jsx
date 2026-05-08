// src/components/tasks/CreateTaskModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import Select from "react-select";
import { X, Calendar, Flag, Users, User, AlertCircle } from "lucide-react";
import { createTask, updateTask } from "../../store/slices/taskSlice";
import { closeModal } from "../../store/slices/uiSlice";
import { getAllUsers } from "../../services/authService";

Modal.setAppElement("#root");

const CreateTaskModal = () => {
  const dispatch = useDispatch();
  const { modalOpen, modalType, modalData } = useSelector((state) => state.ui);
  const { groups } = useSelector((state) => state.groups);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Only show when modalType is 'createTask' or 'editTask'
  const isOpen =
    modalOpen && (modalType === "createTask" || modalType === "editTask");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    type: "personal",
    groupId: "",
    assignedTo: [],
    deadline: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (modalType === "editTask" && modalData) {
      setFormData({
        title: modalData.title || "",
        description: modalData.description || "",
        priority: modalData.priority || "medium",
        status: modalData.status || "pending",
        type: modalData.type || "personal",
        groupId: modalData.groupId || "",
        assignedTo: modalData.assignedTo?.map((u) => u._id) || [],
        deadline: modalData.deadline?.split("T")[0] || "",
      });
    } else if (modalType === "createTask") {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        type: "personal",
        groupId: "",
        assignedTo: [],
        deadline: "",
      });
    }
  }, [modalType, modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter task title");
      return;
    }

    setLoading(true);
    try {
      if (modalType === "editTask") {
        await dispatch(
          updateTask({ id: modalData._id, data: formData }),
        ).unwrap();
      } else {
        await dispatch(createTask(formData)).unwrap();
      }
      dispatch(closeModal());
    } catch (error) {
      console.error("Error saving task:", error);
      alert(error.message || "Error saving task");
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users.map((user) => ({
    value: user?._id,
    label: `${user.name} (${user.email})`,
  }));

  const groupOptions = groups?.map((group) => ({
    value: group?._id,
    label: group?.name,
  }));

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    {
      value: "medium",
      label: "Medium",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
    {
      value: "in-progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "review",
      label: "Review",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
    },
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
            <h2 className="text-xl font-bold">
              {modalType === "editTask" ? "Edit Task" : "Create New Task"}
            </h2>
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
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter task title"
                autoFocus
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter task description (optional)"
              />
            </div>

            {/* Status - Only show in edit mode */}
            {modalType === "editTask" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="flex space-x-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, priority: option.value })
                    }
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                      formData.priority === option.value
                        ? `${option.color} border-transparent ring-2 ring-primary-500`
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
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
                  onClick={() =>
                    setFormData({ ...formData, type: "personal", groupId: "" })
                  }
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                    formData.type === "personal"
                      ? "bg-primary-50 border-primary-500 text-primary-700"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <User size={16} />
                  <span>Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "group" })}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                    formData.type === "group"
                      ? "bg-primary-50 border-primary-500 text-primary-700"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Users size={16} />
                  <span>Group</span>
                </button>
              </div>
            </div>

            {/* Group Selection - Only show if type is group */}
            {formData.type === "group" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Group *
                </label>
                <Select
                  options={groupOptions}
                  value={groupOptions.find(
                    (opt) => opt.value === formData.groupId,
                  )}
                  onChange={(option) =>
                    setFormData({ ...formData, groupId: option?.value || "" })
                  }
                  placeholder="Select a group..."
                  isClearable
                  required
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
                value={userOptions.filter((opt) =>
                  formData.assignedTo.includes(opt.value),
                )}
                onChange={(options) =>
                  setFormData({
                    ...formData,
                    assignedTo: options.map((opt) => opt.value),
                  })
                }
                placeholder="Select users to assign..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <p className="text-xs text-gray-500 mt-1">
                Assigned users will receive email notifications
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Warning for group task without group */}
          {formData.type === "group" && !formData.groupId && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Please select a group for this task
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => dispatch(closeModal())}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (formData.type === "group" && !formData.groupId) ||
                !formData.title.trim()
              }
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {modalType === "editTask" ? "Updating..." : "Creating..."}
                  </span>
                </>
              ) : (
                <span>
                  {modalType === "editTask" ? "Update Task" : "Create Task"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
