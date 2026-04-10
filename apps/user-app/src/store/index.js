import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import sosReducer from './slices/sosSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    sos: sosReducer,
  },
})