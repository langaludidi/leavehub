import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement'
  read: boolean
  createdAt: string
  targetRole?: string[]
  priority: 'low' | 'medium' | 'high'
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void
  getNotificationsByType: (type: string) => Notification[]
  showWelcomeNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Default notifications for demo
const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to LeaveHub! 🎉',
    message: 'Welcome to your new employee leave management system. Explore your dashboard to get started with managing your time off, viewing team calendars, and accessing company resources.',
    type: 'announcement',
    read: false,
    createdAt: new Date().toISOString(),
    priority: 'high'
  },
  {
    id: '2',
    title: 'Holiday Schedule Updated',
    message: 'The company holiday schedule for 2024 has been updated. Please review the new dates in the calendar section.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    priority: 'medium'
  },
  {
    id: '3',
    title: 'New HR Policy',
    message: 'A new remote work policy has been added to the documents section. Please review and acknowledge.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    priority: 'medium'
  }
]

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('leavehub-notifications')
      return stored ? JSON.parse(stored) : defaultNotifications
    } catch {
      return defaultNotifications
    }
  })

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('leavehub-notifications', JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type)
  }

  const showWelcomeNotification = () => {
    // Add a personalized welcome notification
    const motivationalMessages = [
      "Ready to take control of your time off? Let's get started! 💪",
      "Your work-life balance journey starts here! 🌟",
      "Managing your leave has never been easier! 🚀",
      "Welcome aboard! Your team is excited to have you! 🎊",
      "Time to explore all the amazing features we've built for you! ✨"
    ]

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

    addNotification({
      title: '🎉 Welcome to LeaveHub!',
      message: randomMessage,
      type: 'success',
      priority: 'high'
    })
  }

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
    showWelcomeNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}