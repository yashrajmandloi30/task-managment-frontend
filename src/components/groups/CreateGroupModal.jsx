// src/components/groups/CreateGroupModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import Select from "react-select";
import { X, Users } from "lucide-react";
import { createGroup, updateGroup } from "../../store/slices/groupSlice";
import { closeModal } from "../../store/slices/uiSlice";
import { getAllUsers } from "../../services/authService";

Modal.setAppElement("#root");

const CreateGroupModal = () => {
  const dispatch = useDispatch();
  const { modalOpen, modalType, modalData } = useSelector((state) => state.ui);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    participants: [],
  });

  // ✅ Only show when modalType is 'createGroup' or 'editGroup'
  const isOpen =
    modalOpen && (modalType === "createGroup" || modalType === "editGroup");

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
    if (modalType === "editGroup" && modalData) {
      setFormData({
        name: modalData.name || "",
        participants:
          modalData.participants?.map((p) => p.user?._id || p.user) || [],
      });
    } else if (modalType === "createGroup") {
      setFormData({ name: "", participants: [] });
    }
  }, [modalType, modalData]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter group name");
      return;
    }

    setLoading(true);
    try {
      if (modalType === "editGroup") {
        await dispatch(
          updateGroup({ id: modalData._id, data: formData }),
        ).unwrap();
      } else {
        await dispatch(createGroup(formData)).unwrap();
      }
      dispatch(closeModal());
      toast.success(
        modalType === "editGroup"
          ? "Group updated successfully!"
          : "Group created successfully!",
      );
    } catch (error) {
      console.error("Error saving group:", error);
      // Show specific error message
      if (
        error?.message?.includes("duplicate") ||
        error?.message?.includes("already exists")
      ) {
        toast.error(
          "A group with this name already exists. Please choose a different name.",
        );
      } else {
        toast.error(error?.message || "Error saving group");
      }
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users.map((user) => ({
    value: user._id,
    label: `${user.name} (${user.email})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => dispatch(closeModal())}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Users size={24} className="text-primary-600" />
            <h2 className="text-xl font-bold">
              {modalType === "editGroup" ? "Edit Group" : "Create New Group"}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter group name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Members
              </label>
              <Select
                isMulti
                options={userOptions}
                value={userOptions.filter((opt) =>
                  formData.participants.includes(opt.value),
                )}
                onChange={(options) =>
                  setFormData({
                    ...formData,
                    participants: options.map((opt) => opt.value),
                  })
                }
                placeholder="Search and select users..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can add multiple members. They will be notified.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => dispatch(closeModal())}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                  <span>
                    {modalType === "editGroup" ? "Updating..." : "Creating..."}
                  </span>
                </>
              ) : (
                <span>
                  {modalType === "editGroup" ? "Update Group" : "Create Group"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;
