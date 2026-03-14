<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useProjectStore } from '../stores/project'

const projectStore = useProjectStore()

onMounted(() => {
  projectStore.fetchProjects()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <nav class="mb-2 text-xs text-app-text-subtle">
        <span>ManageMe</span>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">Dashboard</span>
      </nav>
      <h1 class="app-page-title">Dashboard</h1>
      <p class="app-page-description">Overview of your current workspace.</p>
    </div>

    <div
      v-if="projectStore.activeProject"
      class="app-panel overflow-hidden"
    >
      <div class="border-b border-app-primary-subtle bg-app-primary-subtle/40 px-5 py-4">
        <span class="app-badge app-badge-success">Active project</span>
        <h2 class="mt-2 text-xl font-medium text-app-text">
          {{ projectStore.activeProject.name }}
        </h2>
        <p
          v-if="projectStore.activeProject.description"
          class="mt-1 text-sm text-app-text-subtle"
        >
          {{ projectStore.activeProject.description }}
        </p>
      </div>
      <div class="px-5 py-4">
        <p class="text-sm text-app-text-subtle">
          Stories and other data shown in the app will belong to this project.
        </p>
        <div class="mt-4 flex flex-wrap gap-4">
          <RouterLink
            to="/stories"
            class="app-btn-primary inline-flex"
          >
            View stories
          </RouterLink>
          <RouterLink
            to="/projects"
            class="inline-flex text-sm font-medium text-app-primary hover:text-app-primary-hover hover:underline"
          >
            View all projects
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="app-panel px-5 py-10 text-center">
      <div
        class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-app-warning-bg"
      >
        <svg
          class="h-6 w-6 text-app-warning"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>
      <h2 class="text-base font-medium text-app-text">No active project</h2>
      <p class="mx-auto mt-2 max-w-sm text-sm text-app-text-subtle">
        Select a project to scope the data you see in the app.
      </p>
      <RouterLink to="/projects" class="app-btn-primary mt-5 inline-flex">
        Choose a project
      </RouterLink>
    </div>
  </div>
</template>
