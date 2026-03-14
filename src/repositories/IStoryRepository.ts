import type { Story, CreateStoryInput, UpdateStoryInput } from '../types/Story'

export interface IStoryRepository {
  create(input: CreateStoryInput): Promise<Story>
  getAll(): Promise<Story[]>
  getByProjectId(projectId: string): Promise<Story[]>
  getById(id: string): Promise<Story | null>
  update(id: string, input: UpdateStoryInput): Promise<Story | null>
  delete(id: string): Promise<boolean>
}
