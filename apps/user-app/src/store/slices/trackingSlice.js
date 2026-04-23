import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Set when sos:accepted socket event is received
  activeTracking: null,
  // {
  //   sosId, volunteerId, volunteerName
  //   volunteerLat, volunteerLng  ← updated every 3s via socket
  //   victimLat, victimLng        ← victim's own position
  // }
}

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    startTracking: (state, action) => {
      state.activeTracking = action.payload
    },

    updateVolunteerPosition: (state, action) => {
      if (state.activeTracking) {
        state.activeTracking.volunteerLat = action.payload.latitude
        state.activeTracking.volunteerLng = action.payload.longitude
      }
    },

    stopTracking: (state) => {
      state.activeTracking = null
    },
  },
})

export const {
  startTracking,
  updateVolunteerPosition,
  stopTracking,
} = trackingSlice.actions

export const selectActiveTracking = (state) => state.tracking.activeTracking

export default trackingSlice.reducer