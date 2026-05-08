import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../store/slices/authSlice'
import chatReducer from '../store/slices/chatSlice'
import taskReducer from '../store/slices/taskSlice'
import groupReducer from '../store/slices/groupSlice'
import uiReducer from '../store/slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    tasks: taskReducer,
    groups: groupReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store