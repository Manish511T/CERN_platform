import { io } from 'socket.io-client'
import { SOCKET_URL } from '../shared/constants'

// Single socket instance — autoConnect false so we control when it connects
// Connection happens after login, disconnection on logout

const socket = io(SOCKET_URL, {
  autoConnect:  false,
  transports:   ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay:    1000,
})

socket.on('connect', () => {
  console.log('Socket connected:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason)
})

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message)
})

export default socket