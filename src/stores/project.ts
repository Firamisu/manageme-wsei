import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CreateProjectInput, Project } from '../types/Project'
import { projectService } from '../services/ProjectService'

const ACTIVE_PROJECT_KEY = 'activeProjectId'

function readActiveProjectId(): string | null {
  if (typeof localStorage?.getItem !== 'function') {
    return null
  }
  return localStorage.getItem(ACTIVE_PROJECT_KEY)
}

function writeActiveProjectId(id: string | null): void {
  if (typeof localStorage?.setItem !== 'function') {
    return
  }
  if (id) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id)
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_KEY)
  }
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const activeProjectId = ref<string | null>(null)
  let activeProjectRestored = false
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeProject = computed(
    () => projects.value.find((p) => p.id === activeProjectId.value) ?? null,
  )

  function syncActiveProject(): void {
    if (
      activeProjectId.value &&
      !projects.value.some((p) => p.id === activeProjectId.value)
    ) {
      activeProjectId.value = null
      writeActiveProjectId(null)
    }
  }

  function restoreActiveProjectId(): void {
    if (!activeProjectRestored) {
      activeProjectId.value = readActiveProjectId()
      activeProjectRestored = true
    }
  }

  async function fetchProjects(): Promise<void> {
    restoreActiveProjectId()
    loading.value = true
    error.value = null
    try {
      projects.value = await projectService.getAllProjects()
      syncActiveProject()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load projects'
    } finally {
      loading.value = false
    }
  }

  function setActiveProject(id: string): void {
    restoreActiveProjectId()
    if (!projects.value.some((p) => p.id === id)) {
      return
    }
    activeProjectId.value = id
    writeActiveProjectId(id)
  }

  function clearActiveProject(): void {
    activeProjectId.value = null
    writeActiveProjectId(null)
  }

  async function createProject(input: CreateProjectInput): Promise<Project> {
    const project = await projectService.createProject(input)
    projects.value = await projectService.getAllProjects()
    return project
  }

  return {
    projects,
    activeProjectId,
    activeProject,
    loading,
    error,
    fetchProjects,
    setActiveProject,
    clearActiveProject,
    createProject,
  }
})
