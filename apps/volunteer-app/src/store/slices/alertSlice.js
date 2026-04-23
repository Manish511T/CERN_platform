import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  incomingAlert: null,
  activeRescue:  null,
  // activeRescue shape:
  // {
  //   sosId, victimId, victimName, victimPhone,
  //   victimLat, victimLng  ← always numbers, never raw coordinates array
  // }
  history:   [],
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
      state.incomingAlert = null
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