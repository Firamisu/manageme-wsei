import type { UserRole } from './User'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskState = 'todo' | 'doing' | 'done'

export const TASK_ASSIGNEE_ROLES: UserRole[] = ['devops', 'developer']

export interface Task {
  id: string
  name: string
  description: string
  priority: TaskPriority
  storyId: string
  estimatedCompletionHours: number
  state: TaskState
  createdAt: Date
  startDate?: Date
  endDate?: Date
  assignedUserId?: string
}

export type CreateTaskInput = Omit<
  Task,
  'id' | 'createdAt' | 'startDate' | 'endDate' | 'assignedUserId'
>

export type UpdateTaskInput = Partial<
  Omit<CreateTaskInput, 'storyId'> & {
    startDate?: Date | null
    endDate?: Date | null
    assignedUserId?: string | null
  }
>

export function isTaskDoing(task: Task): task is Task & { state: 'doing'; startDate: Date; assignedUserId: string } {
  return task.state === 'doing'
}

export function isTaskDone(task: Task): task is Task & { state: 'done'; startDate: Date; endDate: Date; assignedUserId: string } {
  return task.state === 'done'
}
