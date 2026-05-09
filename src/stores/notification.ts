import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { LOGGED_IN_USER_ID } from '../data/mockUsers'
import type { Notification } from '../types/Notification'
import { notificationService } from '../services/NotificationService'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length,
  )

  async function fetchNotifications(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      notifications.value = await notificationService.getNotificationsForUser(
        LOGGED_IN_USER_ID,
      )
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load notifications'
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string): Promise<void> {
    const updated = await notificationService.markAsRead(id)
    if (updated) {
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value[index] = updated
      }
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
  }
})
