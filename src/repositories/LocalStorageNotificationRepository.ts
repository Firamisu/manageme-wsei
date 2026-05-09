import { v4 as uuidv4 } from 'uuid'
import type { Notification, CreateNotificationInput } from '../types/Notification'
import type { INotificationRepository } from './INotificationRepository'

const STORAGE_KEY = 'notifications'

export class LocalStorageNotificationRepository implements INotificationRepository {
  private getNotifications(): Notification[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveNotifications(notifications: Notification[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification: Notification = {
      ...input,
      id: uuidv4(),
      read: false,
      createdAt: new Date(),
    }

    const notifications = this.getNotifications()
    notifications.unshift(notification)
    this.saveNotifications(notifications)
    return notification
  }

  async getAll(): Promise<Notification[]> {
    return this.getNotifications()
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    return this.getNotifications()
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getById(id: string): Promise<Notification | null> {
    return this.getNotifications().find((n) => n.id === id) ?? null
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notifications = this.getNotifications()
    const index = notifications.findIndex((n) => n.id === id)
    if (index === -1) return null

    notifications[index] = { ...notifications[index]!, read: true }
    this.saveNotifications(notifications)
    return notifications[index]!
  }
}
