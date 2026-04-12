import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user:        null,
  accessToken: null,
  isLoading:   true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isLoading   = false
    },
    setAccessToken: (state, action) => { state.accessToken = action.payload },
    setUser:        (state, action) => { state.user = action.payload },
    logout:         (state) => {
      state.user        = null
      state.accessToken = null
      state.isLoading   = false
    },
    setLoading: (state, action) => { state.isLoading = action.payload },
  },
})

export const {
  setCredentials, setAccessToken, setUser, logout, setLoading,
} = authSlice.actions

export const selectUser      = (state) => state.auth.user
export const selectIsLoading = (state) => state.auth.isLoading
export const selectIsAuth    = (state) => !!state.auth.user

export default authSlice.reducer