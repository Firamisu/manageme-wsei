export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  title: string
  content: string
  createdAt: Date
  priority: NotificationPriority
  read: boolean
  userId: string
}

export type CreateNotificationInput = Omit<Notification, 'id' | 'createdAt' | 'read'>
