<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { NotificationPriority } from '../types/Notification'
import { useNotificationStore } from '../stores/notification'

const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.fetchNotifications()
})

function priorityBadgeClass(p: NotificationPriority): string {
  if (p === 'high') return 'app-badge-warning'
  if (p === 'medium') return 'app-badge-info'
  return 'bg-app-surface-raised text-app-text-subtle'
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleString()
}
</script>

<template>
  <div>
    <div class="mb-6">
      <nav class="mb-2 text-xs text-app-text-subtle">
        <span>ManageMe</span>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">Notifications</span>
      </nav>
      <h1 class="app-page-title">Notifications</h1>
      <p class="app-page-description">
        {{ notificationStore.unreadCount }} unread
      </p>
    </div>

    <div class="app-panel">
      <div class="app-panel-header">All notifications</div>

      <p v-if="notificationStore.loading" class="px-4 py-8 text-sm text-app-text-subtle">
        Loading notifications…
      </p>
      <p v-else-if="notificationStore.error" class="px-4 py-8 text-sm text-app-danger">
        {{ notificationStore.error }}
      </p>
      <p
        v-else-if="notificationStore.notifications.length === 0"
        class="px-4 py-10 text-center text-sm text-app-text-subtle"
      >
        No notifications yet.
      </p>

      <ul v-else>
        <li
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          class="app-list-row"
          :class="{ 'app-list-row-active': !notification.read }"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="truncate text-sm font-medium text-app-text">
                {{ notification.title }}
              </h2>
              <span class="app-badge" :class="priorityBadgeClass(notification.priority)">
                {{ notification.priority }}
              </span>
              <span
                v-if="!notification.read"
                class="app-badge app-badge-info !normal-case !tracking-normal"
              >
                unread
              </span>
            </div>
            <p class="mt-0.5 line-clamp-2 text-xs text-app-text-subtle">
              {{ notification.content }}
            </p>
            <p class="mt-1 text-xs text-app-text-subtle">
              {{ formatDate(notification.createdAt) }}
            </p>
          </div>
          <RouterLink
            :to="`/notifications/${notification.id}`"
            class="app-btn-primary shrink-0"
          >
            Open
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
