import type { Notification, CreateNotificationInput } from '../types/Notification'
import type { INotificationRepository } from '../repositories/INotificationRepository'
import { LocalStorageNotificationRepository } from '../repositories/LocalStorageNotificationRepository'
import type { IUserRepository } from '../repositories/IUserRepository'
import { MockUserRepository } from '../repositories/MockUserRepository'
import type { IStoryRepository } from '../repositories/IStoryRepository'
import { LocalStorageStoryRepository } from '../repositories/LocalStorageStoryRepository'
import type { Project } from '../types/Project'
import type { Task } from '../types/Task'
import type { TaskState } from '../types/Task'

export class NotificationService {
  private repository: INotificationRepository
  private userRepository: IUserRepository
  private storyRepository: IStoryRepository

  constructor(
    repository?: INotificationRepository,
    userRepository?: IUserRepository,
    storyRepository?: IStoryRepository,
  ) {
    this.repository = repository || new LocalStorageNotificationRepository()
    this.userRepository = userRepository || new MockUserRepository()
    this.storyRepository = storyRepository || new LocalStorageStoryRepository()
  }

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    if (!input.title?.trim()) {
      throw new Error('Notification title is required')
    }
    if (!input.userId) {
      throw new Error('User ID is required')
    }
    return this.repository.create(input)
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.repository.getByUserId(userId)
  }

  async getNotification(id: string): Promise<Notification | null> {
    if (!id) {
      throw new Error('Notification ID is required')
    }
    return this.repository.getById(id)
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotificationsForUser(userId)
    return notifications.filter((n) => !n.read).length
  }

  async markAsRead(id: string): Promise<Notification | null> {
    if (!id) {
      throw new Error('Notification ID is required')
    }
    return this.repository.markAsRead(id)
  }

  async notifyProjectCreated(project: Project): Promise<void> {
    const admins = (await this.userRepository.getAll()).filter((u) => u.role === 'admin')
    await Promise.all(
      admins.map((admin) =>
        this.createNotification({
          userId: admin.id,
          title: 'New project created',
          content: `Project "${project.name}" was created.`,
          priority: 'high',
        }),
      ),
    )
  }

  async notifyUserAssignedToTask(task: Task, assigneeUserId: string): Promise<void> {
    await this.createNotification({
      userId: assigneeUserId,
      title: 'Task assigned to you',
      content: `You were assigned to task "${task.name}".`,
      priority: 'high',
    })
  }

  async notifyTaskCreated(task: Task): Promise<void> {
    const ownerId = await this.getStoryOwnerId(task.storyId)
    if (!ownerId) return

    await this.createNotification({
      userId: ownerId,
      title: 'New task in story',
      content: `Task "${task.name}" was added to your story.`,
      priority: 'medium',
    })
  }

  async notifyTaskRemoved(task: Task): Promise<void> {
    const ownerId = await this.getStoryOwnerId(task.storyId)
    if (!ownerId) return

    await this.createNotification({
      userId: ownerId,
      title: 'Task removed from story',
      content: `Task "${task.name}" was removed from your story.`,
      priority: 'medium',
    })
  }

  async notifyTaskStatusChanged(
    task: Task,
    previousState: TaskState,
  ): Promise<void> {
    if (task.state === previousState) return

    const ownerId = await this.getStoryOwnerId(task.storyId)
    if (!ownerId) return

    if (task.state === 'doing') {
      await this.createNotification({
        userId: ownerId,
        title: 'Task status updated',
        content: `Task "${task.name}" is now in progress.`,
        priority: 'low',
      })
      return
    }

    if (task.state === 'done') {
      await this.createNotification({
        userId: ownerId,
        title: 'Task completed',
        content: `Task "${task.name}" was marked as done.`,
        priority: 'medium',
      })
    }
  }

  private async getStoryOwnerId(storyId: string): Promise<string | null> {
    const story = await this.storyRepository.getById(storyId)
    return story?.ownerId ?? null
  }
}

export const notificationService = new NotificationService()
