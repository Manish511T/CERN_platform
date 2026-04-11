import { io } from 'socket.io-client'
import { SOCKET_URL } from '../shared/constants'

const socket = io(SOCKET_URL, {
  autoConnect:         false,
  transports:          ['websocket', 'polling'],
  reconnection:        true,
  reconnectionAttempts: 10,
  reconnectionDelay:   1000,
})

socket.on('connect',       ()    => console.log('Volunteer socket connected:', socket.id))
socket.on('disconnect',    (r)   => console.log('Socket disconnected:', r))
socket.on('connect_error', (err) => console.error('Socket error:', err.message))

export default socket