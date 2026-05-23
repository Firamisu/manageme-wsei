<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { LOGGED_IN_USER_ID } from '../data/mockUsers'
import type { TaskPriority, TaskState } from '../types/Task'
import { TASK_ASSIGNEE_ROLES } from '../types/Task'
import { useProjectStore } from '../stores/project'
import { useStoryStore } from '../stores/story'
import { useTaskStore } from '../stores/task'
import { useUserStore, formatUserName } from '../stores/user'
import { storyService } from '../services/StoryService'
import type { Story } from '../types/Story'

const route = useRoute()
const projectStore = useProjectStore()
const storyStore = useStoryStore()
const taskStore = useTaskStore()
const userStore = useUserStore()

const story = ref<Story | null>(null)
const actionError = ref<string | null>(null)
const saving = ref(false)

const selectedState = ref<TaskState>('todo')
const assigneeId = ref('')

const states: TaskState[] = ['todo', 'doing', 'done']

const taskId = computed(() => route.params.id as string)

const isAdmin = computed(() => userStore.currentUser?.role === 'admin')

const assignableUsers = computed(() =>
  userStore.users.filter((u) => TASK_ASSIGNEE_ROLES.includes(u.role)),
)

onMounted(async () => {
  await projectStore.fetchProjects()
  await userStore.fetchUsers()
  await loadTask()
})

watch(taskId, loadTask)

watch(
  () => taskStore.task,
  (task) => {
    if (!task) return
    selectedState.value = task.state
    assigneeId.value = task.assignedUserId ?? ''
  },
  { immediate: true },
)

async function loadTask(): Promise<void> {
  await taskStore.fetchTask(taskId.value)
  const task = taskStore.task
  if (task) {
    story.value = await storyService.getStory(task.storyId)
    await storyStore.fetchStories()
  } else {
    story.value = null
  }
}

function formatDate(value: Date | string | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function priorityBadgeClass(p: TaskPriority): string {
  if (p === 'high') return 'app-badge-warning'
  if (p === 'medium') return 'app-badge-info'
  return 'bg-app-surface-raised text-app-text-subtle'
}

function stateBadgeClass(s: TaskState): string {
  if (s === 'done') return 'app-badge-success'
  if (s === 'doing') return 'app-badge-info'
  return 'bg-app-surface-raised text-app-text-subtle'
}

async function handleStateUpdate(): Promise<void> {
  const task = taskStore.task
  if (!task) return

  actionError.value = null
  saving.value = true
  try {
    if (selectedState.value === 'done' && task.state === 'doing') {
      await taskStore.markTaskDone(task.id)
    } else {
      await taskStore.updateTask(task.id, { state: selectedState.value })
    }
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Failed to update state'
    selectedState.value = task.state
  } finally {
    saving.value = false
  }
}

async function handleAssign(): Promise<void> {
  const task = taskStore.task
  if (!task || !assigneeId.value) return

  actionError.value = null
  saving.value = true
  try {
    await taskStore.assignTask(task.id, assigneeId.value, LOGGED_IN_USER_ID)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Failed to assign task'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <nav class="mb-2 text-xs text-app-text-subtle">
        <span>ManageMe</span>
        <span class="mx-1.5">/</span>
        <RouterLink to="/stories" class="hover:text-app-text">Stories</RouterLink>
        <template v-if="story">
          <span class="mx-1.5">/</span>
          <RouterLink
            :to="`/stories/${story.id}/tasks`"
            class="hover:text-app-text"
          >
            {{ story.name }}
          </RouterLink>
        </template>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">Task</span>
      </nav>
      <h1 class="app-page-title">Task details</h1>
    </div>

    <p v-if="taskStore.loading" class="text-sm text-app-text-subtle">Loading task…</p>
    <p v-else-if="taskStore.error" class="text-sm text-app-danger">{{ taskStore.error }}</p>

    <div v-else-if="!taskStore.task" class="app-panel px-5 py-10 text-center">
      <h2 class="text-base font-medium text-app-text">Task not found</h2>
      <RouterLink to="/stories" class="app-btn-primary mt-5 inline-flex">
        Back to stories
      </RouterLink>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <div class="app-panel lg:col-span-2">
        <div class="app-panel-header flex flex-wrap items-center gap-2">
          <span>{{ taskStore.task.name }}</span>
          <span class="app-badge" :class="priorityBadgeClass(taskStore.task.priority)">
            {{ taskStore.task.priority }}
          </span>
          <span class="app-badge" :class="stateBadgeClass(taskStore.task.state)">
            {{ taskStore.task.state }}
          </span>
        </div>
        <dl class="grid gap-4 p-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <dt class="text-xs font-semibold text-app-text-subtle">Description</dt>
            <dd class="mt-1 text-sm text-app-text">
              {{ taskStore.task.description || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">Story</dt>
            <dd class="mt-1 text-sm text-app-text">
              <RouterLink
                v-if="story"
                :to="`/stories/${story.id}/tasks`"
                class="text-app-primary hover:underline"
              >
                {{ story.name }}
              </RouterLink>
              <span v-else>—</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">Estimated time (hours)</dt>
            <dd class="mt-1 text-sm text-app-text">
              {{ taskStore.task.estimatedCompletionHours }} h
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">Assigned to</dt>
            <dd class="mt-1 text-sm text-app-text">
              {{
                taskStore.task.assignedUserId
                  ? userStore.getUserDisplayName(taskStore.task.assignedUserId)
                  : '—'
              }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">Created</dt>
            <dd class="mt-1 text-sm text-app-text">
              {{ formatDate(taskStore.task.createdAt) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">Start date</dt>
            <dd class="mt-1 text-sm text-app-text">
              {{ formatDate(taskStore.task.startDate) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-app-text-subtle">End date</dt>
            <dd class="mt-1 text-sm text-app-text">
              {{ formatDate(taskStore.task.endDate) }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="space-y-6">
        <div class="app-panel">
          <div class="app-panel-header">Change state</div>
          <div class="space-y-4 p-4">
            <select v-model="selectedState" class="app-input" :disabled="saving">
              <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
            </select>
            <p
              v-if="selectedState === 'done' && taskStore.task.state === 'doing'"
              class="text-xs text-app-text-subtle"
            >
              Marks the task done and sets the end date to now.
            </p>
            <button
              type="button"
              class="app-btn-primary w-full"
              :disabled="saving || selectedState === taskStore.task.state"
              @click="handleStateUpdate"
            >
              {{ saving ? 'Saving…' : 'Update state' }}
            </button>
          </div>
        </div>

        <div v-if="isAdmin" class="app-panel">
          <div class="app-panel-header">Assign user</div>
          <div class="space-y-4 p-4">
            <select
              v-model="assigneeId"
              class="app-input"
              :disabled="saving || taskStore.task.state === 'done'"
            >
              <option disabled value="">Select user</option>
              <option
                v-for="user in assignableUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ formatUserName(user) }} ({{ user.role }})
              </option>
            </select>
            <button
              type="button"
              class="app-btn-primary w-full"
              :disabled="saving || !assigneeId || taskStore.task.state === 'done'"
              @click="handleAssign"
            >
              {{ saving ? 'Assigning…' : 'Assign' }}
            </button>
          </div>
        </div>

        <p v-if="actionError" class="text-sm text-app-danger">{{ actionError }}</p>

        <RouterLink
          v-if="story"
          :to="`/stories/${story.id}/tasks`"
          class="app-btn-subtle inline-flex w-full justify-center"
        >
          Back to story tasks
        </RouterLink>
      </div>
    </div>
  </div>
</template>
