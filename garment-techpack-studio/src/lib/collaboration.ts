export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'designer' | 'buyer' | 'manufacturer' | 'admin'
  avatar: string
  isOnline: boolean
  lastSeen: number
}

export interface GlobalChatMessage {
  id: string
  userId: string
  userName: string
  avatar: string
  text: string
  timestamp: number
}

export interface Notification {
  id: string
  type: 'approval' | 'comment' | 'status_change' | 'mention'
  techPackId: string
  techPackName: string
  fromUser: string
  message: string
  timestamp: number
  read: boolean
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'u1', name: 'You (Designer)', email: 'designer@studio.com', role: 'designer', avatar: 'D', isOnline: true, lastSeen: Date.now() },
  { id: 'u2', name: 'Sarah K.', email: 'sarah@buyerco.com', role: 'buyer', avatar: 'S', isOnline: true, lastSeen: Date.now() },
  { id: 'u3', name: 'James R.', email: 'james@buyerco.com', role: 'buyer', avatar: 'J', isOnline: false, lastSeen: Date.now() - 3600000 },
  { id: 'u4', name: 'Mark T.', email: 'mark@globalbuyer.com', role: 'buyer', avatar: 'M', isOnline: true, lastSeen: Date.now() },
  { id: 'u5', name: 'Priya M.', email: 'priya@factory.in', role: 'manufacturer', avatar: 'P', isOnline: false, lastSeen: Date.now() - 7200000 },
  { id: 'u6', name: 'Raj V.', email: 'raj@factory.in', role: 'manufacturer', avatar: 'R', isOnline: true, lastSeen: Date.now() },
]

const CHAT_KEY = 'techpack_global_chat'
const NOTIF_KEY = 'techpack_notifications'

export const CollabService = {
  getGlobalChat: (): GlobalChatMessage[] => {
    try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]') }
    catch { return [] }
  },
  sendGlobalMessage: (msg: Omit<GlobalChatMessage, 'id' | 'timestamp'>) => {
    const all = CollabService.getGlobalChat()
    all.push({ ...msg, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() })
    localStorage.setItem(CHAT_KEY, JSON.stringify(all.slice(-200)))
    return all
  },
  getNotifications: (): Notification[] => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]') }
    catch { return [] }
  },
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const all = CollabService.getNotifications()
    all.unshift({ ...n, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), read: false })
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all.slice(0, 50)))
  },
  markAllRead: () => {
    const all = CollabService.getNotifications().map(n => ({ ...n, read: true }))
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all))
  },
  getOnlineMembers: () => TEAM_MEMBERS.filter(m => m.isOnline),
}
