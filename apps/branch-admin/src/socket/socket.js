import { io } from 'socket.io-client'
import { SOCKET_URL } from '../shared/constants'

const socket = io(SOCKET_URL, {
  autoConnect:          false,
  transports:           ['websocket', 'polling'],
  reconnection:         true,
  reconnectionAttempts: 10,
})

export default socket