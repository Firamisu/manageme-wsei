import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/Task'
import { taskService } from '../services/TaskService'

export const useTaskStore = defineStore('task', () => {
  const task = ref<Task | null>(null)
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTask(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      task.value = await taskService.getTask(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load task'
      task.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchTasksByStory(storyId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      tasks.value = await taskService.getTasksByStory(storyId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load tasks'
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  async function createTask(input: CreateTaskInput): Promise<Task> {
    const created = await taskService.createTask(input)
    await fetchTasksByStory(input.storyId)
    return created
  }

  async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const updated = await taskService.updateTask(id, input)
    if (updated) {
      task.value = updated
      await fetchTasksByStory(updated.storyId)
    }
    return updated
  }

  async function assignTask(
    taskId: string,
    assigneeUserId: string,
    actorUserId: string,
  ): Promise<Task | null> {
    const updated = await taskService.assignTask(taskId, assigneeUserId, actorUserId)
    if (updated) {
      task.value = updated
      await fetchTasksByStory(updated.storyId)
    }
    return updated
  }

  async function markTaskDone(taskId: string): Promise<Task | null> {
    const updated = await taskService.markTaskDone(taskId)
    if (updated) {
      task.value = updated
      await fetchTasksByStory(updated.storyId)
    }
    return updated
  }

  async function deleteTask(id: string, storyId: string): Promise<boolean> {
    const deleted = await taskService.deleteTask(id)
    if (deleted) {
      if (task.value?.id === id) {
        task.value = null
      }
      await fetchTasksByStory(storyId)
    }
    return deleted
  }

  return {
    task,
    tasks,
    loading,
    error,
    fetchTask,
    fetchTasksByStory,
    createTask,
    updateTask,
    assignTask,
    markTaskDone,
    deleteTask,
  }
})
