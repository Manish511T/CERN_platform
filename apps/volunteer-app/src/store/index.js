import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import alertReducer from './slices/alertSlice';
import dutyReducer  from './slices/dutySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alert: alertReducer,
    duty:  dutyReducer,
  },
})