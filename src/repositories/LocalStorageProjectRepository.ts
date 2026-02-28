import { v4 as uuidv4 } from 'uuid'
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/Project'
import type { IProjectRepository } from './IProjectRepository'

const STORAGE_KEY = 'projects'

export class LocalStorageProjectRepository implements IProjectRepository {

  private getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const project: Project = {
      ...input,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const projects = this.getProjects()
    projects.push(project)
    this.saveProjects(projects)
    return project
  }

  async getAll(): Promise<Project[]> {
    return this.getProjects()
  }

  async getById(id: string): Promise<Project | null> {
    const projects = this.getProjects()
    return projects.find((p) => p.id === id) || null
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const projects = this.getProjects()
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) return null

    const updated = {
      ...projects[index],
      ...input,
      updatedAt: new Date(),
    }
    
    projects[index] = updated as Project
    this.saveProjects(projects)

    return updated as Project
  }

  async delete(id: string): Promise<boolean> {
    const projects = this.getProjects()
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) return false

    projects.splice(index, 1)
    this.saveProjects(projects)
    return true
  }
}
