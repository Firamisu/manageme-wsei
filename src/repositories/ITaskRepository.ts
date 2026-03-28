import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/Task'

export interface ITaskRepository {
  create(input: CreateTaskInput): Promise<Task>
  getAll(): Promise<Task[]>
  getByStoryId(storyId: string): Promise<Task[]>
  getById(id: string): Promise<Task | null>
  update(id: string, input: UpdateTaskInput): Promise<Task | null>
  delete(id: string): Promise<boolean>
}
