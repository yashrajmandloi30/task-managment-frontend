// src/store/slices/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    modalOpen: false,
    modalType: null, // 'createTask', 'editTask', 'createGroup', 'editGroup'
    modalData: null,
    isLoading: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalType = action.payload.type; // ✅ Important: type should be set
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = null;
      state.modalData = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { toggleSidebar, openModal, closeModal, setLoading } =
  uiSlice.actions;
export default uiSlice.reducer;
