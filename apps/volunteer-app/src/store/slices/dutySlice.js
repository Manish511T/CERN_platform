import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isOnDuty:  false,
  isToggling: false,
}

const dutySlice = createSlice({
  name: 'duty',
  initialState,
  reducers: {
    setDutyStatus: (state, action) => {
      state.isOnDuty  = action.payload
      state.isToggling = false
    },
    setToggling: (state, action) => {
      state.isToggling = action.payload
    },
  },
})

export const { setDutyStatus, setToggling } = dutySlice.actions

export const selectIsOnDuty   = (state) => state.duty.isOnDuty
export const selectIsToggling = (state) => state.duty.isToggling

export default dutySlice.reducer