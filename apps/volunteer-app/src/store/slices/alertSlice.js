import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Incoming SOS alert (before accepting)
  incomingAlert: null,

  // Active rescue session (after accepting)
  activeRescue: null,
  // {
  //   sosId, victimId, victimName, victimPhone,
  //   victimLocation: { coordinates: [lng, lat] }
  // }

  // Alert history
  history: [],

  isLoading: false,
}

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setIncomingAlert: (state, action) => {
      state.incomingAlert = action.payload
    },

    clearIncomingAlert: (state) => {
      state.incomingAlert = null
    },

    setActiveRescue: (state, action) => {
      state.activeRescue  = action.payload
      state.incomingAlert = null  // clear alert once accepted
    },

    clearActiveRescue: (state) => {
      state.activeRescue = null
    },

    setHistory: (state, action) => {
      state.history = action.payload
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  setIncomingAlert,
  clearIncomingAlert,
  setActiveRescue,
  clearActiveRescue,
  setHistory,
  setLoading,
} = alertSlice.actions

export const selectIncomingAlert = (state) => state.alert.incomingAlert
export const selectActiveRescue  = (state) => state.alert.activeRescue
export const selectHistory       = (state) => state.alert.history
export const selectAlertLoading  = (state) => state.alert.isLoading

export default alertSlice.reducer