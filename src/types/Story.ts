export type StoryPriority = 'low' | 'medium' | 'high'
export type StoryState = 'todo' | 'doing' | 'done'

export interface Story {
  id: string
  name: string
  description: string
  priority: StoryPriority
  projectId: string
  createdAt: Date
  state: StoryState
  ownerId: string
}

export type CreateStoryInput = Omit<Story, 'id' | 'createdAt'>
export type UpdateStoryInput = Partial<Omit<CreateStoryInput, 'projectId'>>
