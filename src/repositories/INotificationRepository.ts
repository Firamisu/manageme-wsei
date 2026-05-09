import type { Notification, CreateNotificationInput } from '../types/Notification'

export interface INotificationRepository {
  create(input: CreateNotificationInput): Promise<Notification>
  getAll(): Promise<Notification[]>
  getByUserId(userId: string): Promise<Notification[]>
  getById(id: string): Promise<Notification | null>
  markAsRead(id: string): Promise<Notification | null>
}
