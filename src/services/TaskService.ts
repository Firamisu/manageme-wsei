import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskPriority,
  TaskState,
} from '../types/Task'
import { TASK_ASSIGNEE_ROLES } from '../types/Task'
import type { ITaskRepository } from '../repositories/ITaskRepository'
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository'
import type { IStoryRepository } from '../repositories/IStoryRepository'
import { LocalStorageStoryRepository } from '../repositories/LocalStorageStoryRepository'
import type { IUserRepository } from '../repositories/IUserRepository'
import { MockUserRepository } from '../repositories/MockUserRepository'
import { notificationService } from './NotificationService'

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']
const STATES: TaskState[] = ['todo', 'doing', 'done']

export class TaskService {
  private repository: ITaskRepository
  private storyRepository: IStoryRepository
  private userRepository: IUserRepository

  constructor(
    repository?: ITaskRepository,
    storyRepository?: IStoryRepository,
    userRepository?: IUserRepository,
  ) {
    this.repository = repository || new LocalStorageTaskRepository()
    this.storyRepository = storyRepository || new LocalStorageStoryRepository()
    this.userRepository = userRepository || new MockUserRepository()
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    this.validateBaseFields(input)

    if (input.state !== 'todo') {
      throw new Error('New tasks must be created in todo state')
    }

    await this.ensureStoryExists(input.storyId)

    const task = await this.repository.create({
      ...input,
      state: 'todo',
    })
    await notificationService.notifyTaskCreated(task)
    return task
  }

  async getAllTasks(): Promise<Task[]> {
    return this.repository.getAll()
  }

  async getTasksByStory(storyId: string): Promise<Task[]> {
    if (!storyId) {
      throw new Error('Story ID is required')
    }
    return this.repository.getByStoryId(storyId)
  }

  async getTask(id: string): Promise<Task | null> {
    if (!id) {
      throw new Error('Task ID is required')
    }
    return this.repository.getById(id)
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    if (!id) {
      throw new Error('Task ID is required')
    }
    if (Object.keys(input).length === 0) {
      throw new Error('At least one field must be provided for update')
    }

    const existing = await this.repository.getById(id)
    if (!existing) {
      return null
    }

    if (input.priority !== undefined && !PRIORITIES.includes(input.priority)) {
      throw new Error('Invalid task priority')
    }
    if (input.state !== undefined && !STATES.includes(input.state)) {
      throw new Error('Invalid task state')
    }
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Task name is required')
    }
    if (
      input.estimatedCompletionHours !== undefined &&
      input.estimatedCompletionHours <= 0
    ) {
      throw new Error('Estimated completion hours must be greater than 0')
    }

    const merged = this.mergeTaskUpdate(existing, input)
    const normalized = this.normalizeTaskForState(merged)
    await this.validateStateRules(normalized)

    const previousState = existing.state
    const patch = this.toUpdatePatch(existing, normalized, input)
    const updated = await this.repository.update(id, patch)
    if (updated) {
      await notificationService.notifyTaskStatusChanged(updated, previousState)
      await this.syncStoryStateIfAllTasksDone(updated.storyId)
    }
    return updated
  }

  async deleteTask(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Task ID is required')
    }
    const existing = await this.repository.getById(id)
    const deleted = await this.repository.delete(id)
    if (deleted && existing) {
      await notificationService.notifyTaskRemoved(existing)
      await this.syncStoryStateIfAllTasksDone(existing.storyId)
    }
    return deleted
  }

  async assignTask(
    taskId: string,
    assigneeUserId: string,
    actorUserId: string,
  ): Promise<Task | null> {
    if (!taskId) {
      throw new Error('Task ID is required')
    }
    if (!assigneeUserId) {
      throw new Error('Assignee user ID is required')
    }

    await this.assertAdmin(actorUserId)
    await this.validateAssignee(assigneeUserId)

    const existing = await this.repository.getById(taskId)
    if (!existing) {
      return null
    }

    if (existing.state === 'done') {
      throw new Error('Cannot assign a task that is already done')
    }

    const updated = await this.repository.update(taskId, {
      assignedUserId: assigneeUserId,
      state: 'doing',
      startDate: new Date(),
      endDate: null,
    })
    if (updated) {
      await notificationService.notifyUserAssignedToTask(updated, assigneeUserId)
      await notificationService.notifyTaskStatusChanged(updated, existing.state)
    }
    return updated
  }

  async markTaskDone(taskId: string): Promise<Task | null> {
    if (!taskId) {
      throw new Error('Task ID is required')
    }

    const existing = await this.repository.getById(taskId)
    if (!existing) {
      return null
    }

    if (existing.state !== 'doing') {
      throw new Error('Only tasks in doing state can be marked as done')
    }

    if (!existing.assignedUserId || !existing.startDate) {
      throw new Error('Task must have an assigned user and start date before completion')
    }

    const updated = await this.repository.update(taskId, {
      state: 'done',
      endDate: new Date(),
    })
    if (updated) {
      await notificationService.notifyTaskStatusChanged(updated, existing.state)
      await this.syncStoryStateIfAllTasksDone(updated.storyId)
    }
    return updated
  }

  private async syncStoryStateIfAllTasksDone(storyId: string): Promise<void> {
    const tasks = await this.repository.getByStoryId(storyId)
    if (tasks.length === 0) {
      return
    }
    if (!tasks.every((task) => task.state === 'done')) {
      return
    }

    const story = await this.storyRepository.getById(storyId)
    if (!story || story.state === 'done') {
      return
    }

    await this.storyRepository.update(storyId, { state: 'done' })
  }

  private async assertAdmin(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('Actor user ID is required')
    }
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new Error('Actor user not found')
    }
    if (user.role !== 'admin') {
      throw new Error('Only admin can assign tasks')
    }
  }

  private validateBaseFields(input: {
    name: string
    storyId: string
    priority: TaskPriority
    state: TaskState
    estimatedCompletionHours: number
  }): void {
    if (!input.name?.trim()) {
      throw new Error('Task name is required')
    }
    if (!input.storyId) {
      throw new Error('Story ID is required')
    }
    if (!PRIORITIES.includes(input.priority)) {
      throw new Error('Invalid task priority')
    }
    if (!STATES.includes(input.state)) {
      throw new Error('Invalid task state')
    }
    if (input.estimatedCompletionHours <= 0) {
      throw new Error('Estimated completion hours must be greater than 0')
    }
  }

  private async ensureStoryExists(storyId: string): Promise<void> {
    const story = await this.storyRepository.getById(storyId)
    if (!story) {
      throw new Error('Story not found')
    }
  }

  private mergeTaskUpdate(existing: Task, input: UpdateTaskInput): Task {
    const next: Task = { ...existing }

    if (input.name !== undefined) next.name = input.name
    if (input.description !== undefined) next.description = input.description
    if (input.priority !== undefined) next.priority = input.priority
    if (input.state !== undefined) next.state = input.state
    if (input.estimatedCompletionHours !== undefined) {
      next.estimatedCompletionHours = input.estimatedCompletionHours
    }

    if (input.startDate === null) {
      delete next.startDate
    } else if (input.startDate !== undefined) {
      next.startDate = input.startDate
    }

    if (input.endDate === null) {
      delete next.endDate
    } else if (input.endDate !== undefined) {
      next.endDate = input.endDate
    }

    if (input.assignedUserId === null) {
      delete next.assignedUserId
    } else if (input.assignedUserId !== undefined) {
      next.assignedUserId = input.assignedUserId
    }

    return next
  }

  private normalizeTaskForState(task: Task): Task {
    const next: Task = { ...task }

    if (next.state === 'todo') {
      delete next.startDate
      delete next.endDate
      delete next.assignedUserId
      return next
    }

    if (next.state === 'doing') {
      if (!next.startDate) {
        next.startDate = new Date()
      }
      delete next.endDate
      return next
    }

    if (next.state === 'done') {
      if (!next.endDate) {
        next.endDate = new Date()
      }
    }

    return next
  }

  private async validateStateRules(task: Task): Promise<void> {
    if (task.state === 'todo') {
      return
    }

    if (!task.assignedUserId) {
      throw new Error('Assigned user is required for tasks in doing or done state')
    }

    await this.validateAssignee(task.assignedUserId)

    if (task.state === 'doing') {
      if (!task.startDate) {
        throw new Error('Start date is required for tasks in doing state')
      }
      return
    }

    if (!task.startDate) {
      throw new Error('Start date is required for tasks in done state')
    }
    if (!task.endDate) {
      throw new Error('End date is required for tasks in done state')
    }
  }

  private async validateAssignee(userId: string): Promise<void> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new Error('Assigned user not found')
    }
    if (!TASK_ASSIGNEE_ROLES.includes(user.role)) {
      throw new Error('Task can only be assigned to a devops or developer')
    }
  }

  private toUpdatePatch(
    existing: Task,
    normalized: Task,
    input: UpdateTaskInput,
  ): UpdateTaskInput {
    const patch: UpdateTaskInput = { ...input }

    if (normalized.state === 'todo') {
      patch.startDate = null
      patch.endDate = null
      patch.assignedUserId = null
    } else if (normalized.state === 'doing') {
      patch.startDate = normalized.startDate
      patch.endDate = null
      patch.assignedUserId = normalized.assignedUserId
    } else if (normalized.state === 'done') {
      patch.startDate = normalized.startDate
      patch.endDate = normalized.endDate
      patch.assignedUserId = normalized.assignedUserId
    }

    if (!input.state) {
      patch.state = undefined
    }

    return patch
  }
}

export const taskService = new TaskService()
