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
  const [allUsers, setAllUsers] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form data state
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

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setAllUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // ✅ CRITICAL: Populate form when modal opens with editTask
  useEffect(() => {
    if (modalOpen && modalType === "editTask" && modalData) {
      // Extract groupId if it's an object
      let groupIdVal = modalData.groupId;
      if (groupIdVal && typeof groupIdVal === "object") groupIdVal = groupIdVal._id || "";

      // Extract assignedTo as array of ids
      let assignedToIds = [];
      if (modalData.assignedTo && Array.isArray(modalData.assignedTo)) {
        assignedToIds = modalData.assignedTo.map((u) => u._id || u);
      }

      setFormData({
        title: modalData.title || "",
        description: modalData.description || "",
        priority: modalData.priority || "medium",
        status: modalData.status || "pending",
        type: modalData.type || "personal",
        groupId: groupIdVal || "",
        assignedTo: assignedToIds,
        deadline: modalData.deadline ? modalData.deadline.split("T")[0] : "",
      });
    } else if (modalOpen && modalType === "createTask") {
      // Reset for create mode
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
  }, [modalOpen, modalType, modalData]); // Dependencies include modalOpen

  // Update group members when group changes
  useEffect(() => {
    if (formData.type === "group" && formData.groupId) {
      const selectedGroup = groups?.find((g) => g._id === formData.groupId);
      if (selectedGroup?.participants) {
        const members = selectedGroup.participants.map((p) => p.user);
        setGroupMembers(members);
      } else setGroupMembers([]);
    } else setGroupMembers([]);
  }, [formData.groupId, formData.type, groups]);

  // Reset assignedTo when group changes (avoid stale selections)
  useEffect(() => {
    if (formData.type === "group") {
      setFormData((prev) => ({ ...prev, assignedTo: [] }));
    }
  }, [formData.groupId, formData.type]);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title.trim()) return alert("Title required");
  if (formData.type === "group" && !formData.groupId) return alert("Select a group");

  const payload = {
    ...formData,
    groupId: formData.type === "personal" ? null : formData.groupId,
    assignedTo: formData.assignedTo || [],
  };

  setLoading(true);
  try {
    if (modalType === "editTask") {
      await dispatch(updateTask({ id: modalData._id, data: payload })).unwrap();
    } else {
      await dispatch(createTask(payload)).unwrap();
    }
    dispatch(closeModal());
  } catch (err) {
    alert(err.message || "Error saving task");
  } finally {
    setLoading(false);
  }
};
  const getAssignOptions = () => {
    if (formData.type === "group") {
      return groupMembers.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` }));
    }
    return allUsers.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` }));
  };

  const groupOptions = groups?.map((g) => ({ value: g._id, label: g.name }));

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "completed", label: "Completed" },
  ];

  if (!modalOpen || (modalType !== "createTask" && modalType !== "editTask")) return null;

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => dispatch(closeModal())}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{modalType === "editTask" ? "Edit Task" : "Create Task"}</h2>
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

          {modalType === "editTask" && (
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: opt.value })}
                className={`flex-1 py-2 rounded-lg border ${formData.priority === opt.value ? opt.color : "bg-white"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "personal", groupId: "", assignedTo: [] })}
              className={`py-2 rounded-lg border ${formData.type === "personal" ? "bg-primary-50 border-primary-500" : "bg-white"}`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "group", assignedTo: [] })}
              className={`py-2 rounded-lg border ${formData.type === "group" ? "bg-primary-50 border-primary-500" : "bg-white"}`}
            >
              Group
            </button>
          </div>

          {formData.type === "group" && (
            <Select
              options={groupOptions}
              value={groupOptions?.find((opt) => opt.value === formData.groupId)}
              onChange={(opt) => setFormData({ ...formData, groupId: opt?.value || "", assignedTo: [] })}
              placeholder="Select group"
              isClearable
            />
          )}

          <div>
            <Select
              isMulti
              options={getAssignOptions()}
              value={getAssignOptions().filter((opt) => formData.assignedTo.includes(opt.value))}
              onChange={(opts) => setFormData({ ...formData, assignedTo: opts.map((o) => o.value) })}
              placeholder={formData.type === "group" && !formData.groupId ? "First select group" : "Assign to users"}
              isDisabled={formData.type === "group" && !formData.groupId}
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
              {loading ? "Saving..." : (modalType === "editTask" ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;