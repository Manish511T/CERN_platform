import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Active SOS session
  activeSOS:  null,      // { sosId, status, emergencyType, location }
  
  // Dispatch result
  lastResult: null,      // { notifiedVolunteers, socketNotified, source }

  // Accepted volunteer info (for tracking)
  volunteer:  null,      // { id, name, location }

  // UI states
  isLoading:  false,
  error:      null,
}

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {
    sosTriggered: (state, action) => {
      state.activeSOS  = {
        sosId:         action.payload.sosId,
        status:        'active',
        emergencyType: action.payload.emergencyType,
      }
      state.lastResult = {
        notifiedVolunteers: action.payload.notifiedVolunteers,
        socketNotified:     action.payload.socketNotified,
        source:             action.payload.escalationSource,
      }
      state.error     = null
      state.isLoading = false
    },

    sosAccepted: (state, action) => {
      if (state.activeSOS) {
        state.activeSOS.status = 'accepted'
      }
      state.volunteer = {
        id:       action.payload.volunteerId,
        name:     action.payload.volunteerName,
        location: action.payload.victimLocation,
      }
    },

    sosResolved: (state) => {
      if (state.activeSOS) {
        state.activeSOS.status = 'resolved'
      }
    },

    sosCancelled: (state) => {
      state.activeSOS  = null
      state.volunteer  = null
      state.lastResult = null
    },

    sosLoading: (state) => {
      state.isLoading = true
      state.error     = null
    },

    sosError: (state, action) => {
      state.isLoading = false
      state.error     = action.payload
    },

    clearSOS: (state) => {
      state.activeSOS  = null
      state.volunteer  = null
      state.lastResult = null
      state.error      = null
      state.isLoading  = false
    },
  },
})

export const {
  sosTriggered,
  sosAccepted,
  sosResolved,
  sosCancelled,
  sosLoading,
  sosError,
  clearSOS,
} = sosSlice.actions

// Selectors
export const selectActiveSOS  = (state) => state.sos.activeSOS
export const selectVolunteer  = (state) => state.sos.volunteer
export const selectLastResult = (state) => state.sos.lastResult
export const selectSOSLoading = (state) => state.sos.isLoading
export const selectSOSError   = (state) => state.sos.error

export default sosSlice.reducer