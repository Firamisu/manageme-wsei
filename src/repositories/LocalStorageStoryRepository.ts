import { v4 as uuidv4 } from 'uuid'
import type { Story, CreateStoryInput, UpdateStoryInput } from '../types/Story'
import type { IStoryRepository } from './IStoryRepository'

const STORAGE_KEY = 'stories'

export class LocalStorageStoryRepository implements IStoryRepository {
  private getStories(): Story[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveStories(stories: Story[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories))
  }

  async create(input: CreateStoryInput): Promise<Story> {
    const story: Story = {
      ...input,
      id: uuidv4(),
      createdAt: new Date(),
    }

    const stories = this.getStories()
    stories.push(story)
    this.saveStories(stories)
    return story
  }

  async getAll(): Promise<Story[]> {
    return this.getStories()
  }

  async getByProjectId(projectId: string): Promise<Story[]> {
    return this.getStories().filter((s) => s.projectId === projectId)
  }

  async getById(id: string): Promise<Story | null> {
    const stories = this.getStories()
    return stories.find((s) => s.id === id) || null
  }

  async update(id: string, input: UpdateStoryInput): Promise<Story | null> {
    const stories = this.getStories()
    const index = stories.findIndex((s) => s.id === id)
    if (index === -1) return null

    const updated = {
      ...stories[index],
      ...input,
    }

    stories[index] = updated as Story
    this.saveStories(stories)
    return updated as Story
  }

  async delete(id: string): Promise<boolean> {
    const stories = this.getStories()
    const index = stories.findIndex((s) => s.id === id)
    if (index === -1) return false

    stories.splice(index, 1)
    this.saveStories(stories)
    return true
  }
}
