import { v4 as uuidv4 } from 'uuid'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/Task'
import type { ITaskRepository } from './ITaskRepository'

const STORAGE_KEY = 'tasks'

export class LocalStorageTaskRepository implements ITaskRepository {
  private getTasks(): Task[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      ...input,
      id: uuidv4(),
      createdAt: new Date(),
    }

    const tasks = this.getTasks()
    tasks.push(task)
    this.saveTasks(tasks)
    return task
  }

  async getAll(): Promise<Task[]> {
    return this.getTasks()
  }

  async getByStoryId(storyId: string): Promise<Task[]> {
    return this.getTasks().filter((t) => t.storyId === storyId)
  }

  async getById(id: string): Promise<Task | null> {
    const tasks = this.getTasks()
    return tasks.find((t) => t.id === id) || null
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const tasks = this.getTasks()
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return null

    const existing = tasks[index]!
    const updated = this.applyUpdate(existing, input)

    tasks[index] = updated
    this.saveTasks(tasks)
    return updated
  }

  private applyUpdate(existing: Task, input: UpdateTaskInput): Task {
    const updated: Task = { ...existing }

    if (input.name !== undefined) updated.name = input.name
    if (input.description !== undefined) updated.description = input.description
    if (input.priority !== undefined) updated.priority = input.priority
    if (input.state !== undefined) updated.state = input.state
    if (input.estimatedCompletionHours !== undefined) {
      updated.estimatedCompletionHours = input.estimatedCompletionHours
    }

    if (input.startDate === null) {
      delete updated.startDate
    } else if (input.startDate !== undefined) {
      updated.startDate = input.startDate
    }

    if (input.endDate === null) {
      delete updated.endDate
    } else if (input.endDate !== undefined) {
      updated.endDate = input.endDate
    }

    if (input.assignedUserId === null) {
      delete updated.assignedUserId
    } else if (input.assignedUserId !== undefined) {
      updated.assignedUserId = input.assignedUserId
    }

    return updated
  }

  async delete(id: string): Promise<boolean> {
    const tasks = this.getTasks()
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return false

    tasks.splice(index, 1)
    this.saveTasks(tasks)
    return true
  }
}
