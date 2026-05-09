<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { Notification, NotificationPriority } from '../types/Notification'
import { notificationService } from '../services/NotificationService'
import { useNotificationStore } from '../stores/notification'

const route = useRoute()
const notificationStore = useNotificationStore()

const notification = ref<Notification | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const notificationId = computed(() => route.params.id as string)

onMounted(async () => {
  await loadAndMarkRead()
})

async function loadAndMarkRead(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const found = await notificationService.getNotification(notificationId.value)
    if (!found) {
      notification.value = null
      return
    }
    notification.value = found
    if (!found.read) {
      await notificationStore.markAsRead(found.id)
      notification.value = { ...found, read: true }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load notification'
  } finally {
    loading.value = false
  }
}

function priorityBadgeClass(p: NotificationPriority): string {
  if (p === 'high') return 'app-badge-warning'
  if (p === 'medium') return 'app-badge-info'
  return 'bg-app-surface-raised text-app-text-subtle'
}

function formatDate(value: Date | string | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}
</script>

<template>
  <div>
    <div class="mb-6">
      <nav class="mb-2 text-xs text-app-text-subtle">
        <span>ManageMe</span>
        <span class="mx-1.5">/</span>
        <RouterLink to="/notifications" class="hover:text-app-text">
          Notifications
        </RouterLink>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">Details</span>
      </nav>
      <h1 class="app-page-title">Notification details</h1>
    </div>

    <p v-if="loading" class="text-sm text-app-text-subtle">Loading…</p>
    <p v-else-if="error" class="text-sm text-app-danger">{{ error }}</p>

    <div v-else-if="!notification" class="app-panel px-5 py-10 text-center">
      <h2 class="text-base font-medium text-app-text">Notification not found</h2>
      <RouterLink to="/notifications" class="app-btn-primary mt-5 inline-flex">
        Back to notifications
      </RouterLink>
    </div>

    <div v-else class="app-panel max-w-2xl">
      <div class="app-panel-header flex items-center gap-2">
        <span>{{ notification.title }}</span>
        <span class="app-badge" :class="priorityBadgeClass(notification.priority)">
          {{ notification.priority }}
        </span>
        <span
          v-if="notification.read"
          class="app-badge app-badge-success !normal-case !tracking-normal"
        >
          read
        </span>
      </div>
      <div class="space-y-4 p-5">
        <p class="text-sm text-app-text">{{ notification.content }}</p>
        <dl class="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">Created</dt>
            <dd class="mt-1 text-app-text">{{ formatDate(notification.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">Status</dt>
            <dd class="mt-1 text-app-text">{{ notification.read ? 'Read' : 'Unread' }}</dd>
          </div>
        </dl>
        <RouterLink to="/notifications" class="app-btn-subtle inline-flex">
          Back to list
        </RouterLink>
      </div>
    </div>
  </div>
</template>
