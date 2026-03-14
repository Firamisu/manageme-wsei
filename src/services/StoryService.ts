import type {
  Story,
  CreateStoryInput,
  UpdateStoryInput,
  StoryPriority,
  StoryState,
} from '../types/Story'
import type { IStoryRepository } from '../repositories/IStoryRepository'
import { LocalStorageStoryRepository } from '../repositories/LocalStorageStoryRepository'

const PRIORITIES: StoryPriority[] = ['low', 'medium', 'high']
const STATES: StoryState[] = ['todo', 'doing', 'done']

export class StoryService {
  private repository: IStoryRepository

  constructor(repository?: IStoryRepository) {
    this.repository = repository || new LocalStorageStoryRepository()
  }

  async createStory(input: CreateStoryInput): Promise<Story> {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Story name is required')
    }
    if (!input.projectId) {
      throw new Error('Project ID is required')
    }
    if (!input.ownerId || input.ownerId.trim() === '') {
      throw new Error('Owner ID is required')
    }
    if (!PRIORITIES.includes(input.priority)) {
      throw new Error('Invalid story priority')
    }
    if (!STATES.includes(input.state)) {
      throw new Error('Invalid story state')
    }
    return this.repository.create(input)
  }

  async getAllStories(): Promise<Story[]> {
    return this.repository.getAll()
  }

  async getStoriesByProject(projectId: string): Promise<Story[]> {
    if (!projectId) {
      throw new Error('Project ID is required')
    }
    return this.repository.getByProjectId(projectId)
  }

  async getStory(id: string): Promise<Story | null> {
    if (!id) {
      throw new Error('Story ID is required')
    }
    return this.repository.getById(id)
  }

  async updateStory(id: string, input: UpdateStoryInput): Promise<Story | null> {
    if (!id) {
      throw new Error('Story ID is required')
    }
    if (Object.keys(input).length === 0) {
      throw new Error('At least one field must be provided for update')
    }
    if (input.priority !== undefined && !PRIORITIES.includes(input.priority)) {
      throw new Error('Invalid story priority')
    }
    if (input.state !== undefined && !STATES.includes(input.state)) {
      throw new Error('Invalid story state')
    }
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Story name is required')
    }
    if (input.ownerId !== undefined && input.ownerId.trim() === '') {
      throw new Error('Owner ID is required')
    }
    return this.repository.update(id, input)
  }

  async deleteStory(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Story ID is required')
    }
    return this.repository.delete(id)
  }
}

export const storyService = new StoryService()
