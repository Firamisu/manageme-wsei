<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProjectStore } from '../stores/project'

const projectStore = useProjectStore()
const newName = ref('')
const newDescription = ref('')
const creating = ref(false)
const createError = ref<string | null>(null)

const projectColors = [
  'bg-app-primary',
  'bg-app-primary-dark',
  'bg-app-primary-hover',
  'bg-[#5243AA]',
  'bg-[#998DD9]',
]

onMounted(() => {
  projectStore.fetchProjects()
})

function isActive(projectId: string): boolean {
  return projectStore.activeProjectId === projectId
}

function projectColor(index: number): string {
  return projectColors[index % projectColors.length] ?? 'bg-app-primary'
}

function projectInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

async function handleCreate(): Promise<void> {
  createError.value = null
  creating.value = true
  try {
    const project = await projectStore.createProject({
      name: newName.value,
      description: newDescription.value,
    })
    newName.value = ''
    newDescription.value = ''
    projectStore.setActiveProject(project.id)
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'Failed to create project'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <nav class="mb-2 text-xs text-app-text-subtle">
        <span>ManageMe</span>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">Projects</span>
      </nav>
      <h1 class="app-page-title">Projects</h1>
      <p class="app-page-description">
        Choose the project you want to work on. All app data is scoped to the active project.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="app-panel lg:col-span-2">
        <div class="app-panel-header flex items-center justify-between">
          <span>All projects</span>
          <span v-if="!projectStore.loading" class="font-normal text-app-text-subtle">
            {{ projectStore.projects.length }}
          </span>
        </div>

        <p v-if="projectStore.loading" class="px-4 py-8 text-sm text-app-text-subtle">
          Loading projects…
        </p>
        <p v-else-if="projectStore.error" class="px-4 py-8 text-sm text-app-danger">
          {{ projectStore.error }}
        </p>
        <p
          v-else-if="projectStore.projects.length === 0"
          class="px-4 py-10 text-center text-sm text-app-text-subtle"
        >
          No projects yet. Create your first project using the form.
        </p>

        <ul v-else>
          <li
            v-for="(project, index) in projectStore.projects"
            :key="project.id"
            class="app-list-row"
            :class="{ 'app-list-row-active': isActive(project.id) }"
          >
            <div
              class="app-project-icon"
              :class="projectColor(index)"
            >
              {{ projectInitial(project.name) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-sm font-medium text-app-text">
                  {{ project.name }}
                </h2>
                <span
                  v-if="isActive(project.id)"
                  class="app-badge app-badge-success"
                >
                  Active
                </span>
              </div>
              <p v-if="project.description" class="mt-0.5 truncate text-xs text-app-text-subtle">
                {{ project.description }}
              </p>
            </div>
            <button
              v-if="!isActive(project.id)"
              type="button"
              class="app-btn-primary shrink-0"
              @click="projectStore.setActiveProject(project.id)"
            >
              Switch to project
            </button>
          </li>
        </ul>
      </div>

      <form class="app-panel h-fit" @submit.prevent="handleCreate">
        <div class="app-panel-header">Create project</div>
        <div class="space-y-4 p-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-app-text-subtle">
              Name <span class="text-app-danger">*</span>
            </label>
            <input
              v-model="newName"
              type="text"
              required
              placeholder="e.g. Platform Team"
              class="app-input"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-app-text-subtle">
              Description
            </label>
            <input
              v-model="newDescription"
              type="text"
              placeholder="What is this project about?"
              class="app-input"
            />
          </div>
          <p v-if="createError" class="text-sm text-app-danger">{{ createError }}</p>
          <button type="submit" :disabled="creating" class="app-btn-primary w-full">
            {{ creating ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
