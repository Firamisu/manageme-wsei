import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/Project'

export interface IProjectRepository {
  create(input: CreateProjectInput): Promise<Project>
  getAll(): Promise<Project[]>
  getById(id: string): Promise<Project | null>
  update(id: string, input: UpdateProjectInput): Promise<Project | null>
  delete(id: string): Promise<boolean>
}
