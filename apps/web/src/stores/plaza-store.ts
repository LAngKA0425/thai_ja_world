import { create } from 'zustand'

interface PlazaUser {
  id: string
  nickname: string
  avatar?: string
  character?: string
  isOnline: boolean
}

interface ChatMessage {
  id: string
  userId: string
  nickname: string
  message: string
  timestamp: string
  avatar?: string
}

interface SystemMessage {
  id: string
  message: string
  timestamp: string
  type: 'join' | 'leave' | 'notice'
}

interface PlazaState {
  users: PlazaUser[]
  myPosition: { x: number; y: number } | null
  chatMessages: ChatMessage[]
  systemMessages: SystemMessage[]
  onlineCount: number
  addUser: (user: PlazaUser) => void
  removeUser: (userId: string) => void
  updateUserPosition: (userId: string, position: { x: number; y: number }) => void
  addChatMessage: (message: ChatMessage) => void
  addSystemMessage: (message: SystemMessage) => void
  setOnlineCount: (count: number) => void
  clearMessages: () => void
}

export const usePlazaStore = create<PlazaState>((set) => ({
  users: [],
  myPosition: null,
  chatMessages: [],
  systemMessages: [],
  onlineCount: 0,

  addUser: (user: PlazaUser) =>
    set((state) => {
      const exists = state.users.some((u) => u.id === user.id)
      if (exists) return state
      return { users: [...state.users, user] }
    }),

  removeUser: (userId: string) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),

  updateUserPosition: (userId: string, position: { x: number; y: number }) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u } : u
      ),
      myPosition: position,
    })),

  addChatMessage: (message: ChatMessage) =>
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-99), message],
    })),

  addSystemMessage: (message: SystemMessage) =>
    set((state) => ({
      systemMessages: [...state.systemMessages.slice(-49), message],
    })),

  setOnlineCount: (count: number) =>
    set({ onlineCount: count }),

  clearMessages: () =>
    set({
      chatMessages: [],
      systemMessages: [],
    }),
}))
