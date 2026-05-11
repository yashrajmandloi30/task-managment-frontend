// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Get initial sidebar state based on screen size
const getInitialSidebarState = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 1024;
  }
  return true; // Default to open on server
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: getInitialSidebarState(),
    modalOpen: false,
    modalType: null,
    modalData: null,
    isLoading: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalType = action.payload.type;
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

export const { 
  toggleSidebar, 
  openSidebar, 
  closeSidebar, 
  openModal, 
  closeModal, 
  setLoading 
} = uiSlice.actions;

export default uiSlice.reducer;