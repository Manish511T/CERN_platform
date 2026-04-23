import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import sosReducer from './slices/sosSlice'
import trackingReducer from './slices/trackingSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sos: sosReducer,
    tracking: trackingReducer,
  },
})