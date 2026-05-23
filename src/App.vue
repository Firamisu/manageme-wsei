<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useProjectStore } from './stores/project'
import { useNotificationStore } from './stores/notification'
import { useThemeStore } from './stores/theme'
import { useUserStore, formatUserName } from './stores/user'

const projectStore = useProjectStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()
const route = useRoute()

onMounted(() => {
  projectStore.fetchProjects()
  userStore.fetchUsers()
  notificationStore.fetchNotifications()
})

function navClass(path: string): string {
  const isActive =
    path === '/notifications'
      ? route.path.startsWith('/notifications')
      : route.path === path
  return isActive ? 'app-nav-item app-nav-item-active' : 'app-nav-item'
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-app-surface">
    <header class="flex h-14 shrink-0 items-center bg-app-primary-dark px-4 text-white shadow-md">
      <RouterLink
        to="/projects"
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
        <RouterLink
          to="/notifications"
          class="relative flex h-8 w-8 items-center justify-center rounded text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            v-if="notificationStore.unreadCount > 0"
            class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-app-danger px-1 text-[10px] font-bold text-white"
          >
            {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
          </span>
        </RouterLink>
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
          <RouterLink to="/notifications" :class="navClass('/notifications')">
            <svg class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            Notifications
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
