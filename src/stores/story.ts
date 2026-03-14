import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CreateStoryInput, Story, UpdateStoryInput } from '../types/Story'
import { storyService } from '../services/StoryService'
import { useProjectStore } from './project'

export const useStoryStore = defineStore('story', () => {
  const stories = ref<Story[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function requireActiveProjectId(): string {
    const projectStore = useProjectStore()
    if (!projectStore.activeProjectId) {
      throw new Error('No active project selected')
    }
    return projectStore.activeProjectId
  }

  async function fetchStories(): Promise<void> {
    const projectStore = useProjectStore()
    if (!projectStore.activeProjectId) {
      stories.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      stories.value = await storyService.getStoriesByProject(projectStore.activeProjectId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load stories'
    } finally {
      loading.value = false
    }
  }

  async function createStory(
    input: Omit<CreateStoryInput, 'projectId'>,
  ): Promise<Story> {
    const projectId = requireActiveProjectId()
    const story = await storyService.createStory({ ...input, projectId })
    await fetchStories()
    return story
  }

  async function updateStory(id: string, input: UpdateStoryInput): Promise<Story | null> {
    const updated = await storyService.updateStory(id, input)
    await fetchStories()
    return updated
  }

  async function deleteStory(id: string): Promise<boolean> {
    const deleted = await storyService.deleteStory(id)
    if (deleted) {
      await fetchStories()
    }
    return deleted
  }

  return {
    stories,
    loading,
    error,
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
  }
})
