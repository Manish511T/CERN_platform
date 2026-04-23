import { io } from 'socket.io-client'
import { SOCKET_URL } from '../shared/constants'

const socket = io(SOCKET_URL, {
  autoConnect:          false,
  transports:           ['websocket', 'polling'],
  reconnection:         true,
  reconnectionAttempts: Infinity,   // never give up
  reconnectionDelay:    1000,
  reconnectionDelayMax: 5000,
  timeout:              20000,
})

socket.on('connect', () => {
  console.log('✅ Volunteer socket connected:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.warn('⚠️ Volunteer socket disconnected:', reason)
  // If server closed connection, reconnect manually
  if (reason === 'io server disconnect') {
    socket.connect()
  }
})

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message)
})

export default socket