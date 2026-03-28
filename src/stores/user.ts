import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { LOGGED_IN_USER_ID, MOCK_USERS } from '../data/mockUsers'
import type { User } from '../types/User'
import { userService } from '../services/UserService'

export function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentUser = computed(() => getUserById(LOGGED_IN_USER_ID) ?? null)

  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      users.value = await userService.getAllUsers()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load users'
    } finally {
      loading.value = false
    }
  }

  function getUserById(id: string): User | undefined {
    return users.value.find((u) => u.id === id) ?? MOCK_USERS.find((u) => u.id === id)
  }

  function getUserDisplayName(id: string): string {
    const user = getUserById(id)
    return user ? formatUserName(user) : 'Unknown user'
  }

  return {
    users,
    loading,
    error,
    currentUser,
    fetchUsers,
    getUserById,
    getUserDisplayName,
  }
})
