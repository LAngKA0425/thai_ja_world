import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initializeSocket(token: string): Socket {
  if (socket?.connected) {
    return socket
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function onPlazaUserJoined(callback: (user: any) => void) {
  if (socket) {
    socket.on('plaza:user-joined', callback)
  }
}

export function onPlazaUserLeft(callback: (userId: string) => void) {
  if (socket) {
    socket.on('plaza:user-left', callback)
  }
}

export function onPlazaMessage(callback: (message: any) => void) {
  if (socket) {
    socket.on('plaza:message', callback)
  }
}

export function onPlazaUserMoved(callback: (data: any) => void) {
  if (socket) {
    socket.on('plaza:user-moved', callback)
  }
}

export function emitPlazaMessage(message: string) {
  if (socket) {
    socket.emit('plaza:message', { message })
  }
}

export function emitPlazaMove(position: { x: number; y: number }) {
  if (socket) {
    socket.emit('plaza:move', { position })
  }
}

export function onBroadcast(callback: (broadcast: any) => void) {
  if (socket) {
    socket.on('broadcast:new', callback)
  }
}

export function onFriendRequest(callback: (request: any) => void) {
  if (socket) {
    socket.on('friend:request', callback)
  }
}

export function onGuestbookEntry(callback: (entry: any) => void) {
  if (socket) {
    socket.on('guestbook:entry', callback)
  }
}

export function offAll() {
  if (socket) {
    socket.offAny()
  }
}
