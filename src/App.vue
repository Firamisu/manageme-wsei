<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useProjectStore } from './stores/project'
import { useThemeStore } from './stores/theme'
import { useUserStore, formatUserName } from './stores/user'

const projectStore = useProjectStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const route = useRoute()

onMounted(() => {
  projectStore.fetchProjects()
  userStore.fetchUsers()
})

function navClass(path: string): string {
  return route.path === path ? 'app-nav-item app-nav-item-active' : 'app-nav-item'
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-app-surface">
    <header class="flex h-14 shrink-0 items-center bg-app-primary-dark px-4 text-white shadow-md">
      <RouterLink
        to="/"
        class="flex items-center gap-2 text-base font-semibold tracking-tight hover:text-white/90"
      >
        <span
          class="flex h-7 w-7 items-center justify-center rounded bg-white/15 text-xs font-bold"
        >
          M
        </span>
        ManageMe
      </RouterLink>

      <nav class="ml-8 hidden items-center gap-1 sm:flex">
        <RouterLink
          to="/"
          class="rounded px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          active-class="!bg-white/15 !text-white font-medium"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/projects"
          class="rounded px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          active-class="!bg-white/15 !text-white font-medium"
        >
          Projects
        </RouterLink>
        <RouterLink
          to="/stories"
          class="rounded px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          active-class="!bg-white/15 !text-white font-medium"
        >
          Stories
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-4 text-sm">
        <button
          type="button"
          class="app-theme-toggle"
          :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="themeStore.isDark ? 'Light mode' : 'Dark mode'"
          @click="themeStore.toggleTheme()"
        >
          <svg
            v-if="themeStore.isDark"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
        <div v-if="userStore.currentUser" class="hidden items-center gap-2 sm:flex">
          <span class="text-white/70">Logged in</span>
          <span class="font-medium text-white">
            {{ formatUserName(userStore.currentUser) }}
          </span>
          <span class="app-badge app-badge-info !normal-case !tracking-normal">
            {{ userStore.currentUser.role }}
          </span>
        </div>
        <span class="hidden text-white/70 sm:inline">Active project</span>
        <span
          v-if="projectStore.activeProject"
          class="app-badge app-badge-success !normal-case !tracking-normal"
        >
          {{ projectStore.activeProject.name }}
        </span>
        <RouterLink
          v-else
          to="/projects"
          class="app-badge app-badge-warning !normal-case !tracking-normal hover:opacity-90"
        >
          None selected
        </RouterLink>
      </div>
    </header>

    <div class="flex flex-1">
      <aside class="hidden w-56 shrink-0 border-r border-app-border bg-app-panel md:block">
        <nav class="p-3">
          <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-app-text-subtle">
            Menu
          </p>
          <RouterLink to="/" :class="navClass('/')">
            <svg class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </RouterLink>
          <RouterLink to="/projects" :class="navClass('/projects')">
            <svg class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            Projects
          </RouterLink>
          <RouterLink to="/stories" :class="navClass('/stories')">
            <svg class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Stories
          </RouterLink>
        </nav>
      </aside>

      <main class="flex-1 overflow-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
