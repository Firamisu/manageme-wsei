import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/Project'
import type { IProjectRepository } from '../repositories/IProjectRepository'
import { LocalStorageProjectRepository } from '../repositories/LocalStorageProjectRepository'

export class ProjectService {
  private repository: IProjectRepository

  constructor(repository?: IProjectRepository) {
    this.repository = repository || new LocalStorageProjectRepository()
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Project name is required')
    }
    return this.repository.create(input)
  }

  async getAllProjects(): Promise<Project[]> {
    return this.repository.getAll()
  }

  async getProject(id: string): Promise<Project | null> {
    if (!id) {
      throw new Error('Project ID is required')
    }
    return this.repository.getById(id)
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project | null> {
    if (!id) {
      throw new Error('Project ID is required')
    }
    if (Object.keys(input).length === 0) {
      throw new Error('At least one field must be provided for update')
    }
    return this.repository.update(id, input)
  }

  async deleteProject(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Project ID is required')
    }
    return this.repository.delete(id)
  }
}

export const projectService = new ProjectService()
