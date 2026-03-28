<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { Task, TaskPriority, TaskState } from '../types/Task'
import { useProjectStore } from '../stores/project'
import { useTaskStore } from '../stores/task'
import { useUserStore } from '../stores/user'
import { storyService } from '../services/StoryService'
import type { Story } from '../types/Story'

const route = useRoute()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const userStore = useUserStore()

const story = ref<Story | null>(null)
const formError = ref<string | null>(null)
const creating = ref(false)

const name = ref('')
const description = ref('')
const priority = ref<TaskPriority>('medium')
const estimatedCompletionHours = ref(1)

const priorities: TaskPriority[] = ['low', 'medium', 'high']

const columns: { state: TaskState; label: string }[] = [
  { state: 'todo', label: 'To do' },
  { state: 'doing', label: 'In progress' },
  { state: 'done', label: 'Done' },
]

const storyId = computed(() => route.params.storyId as string)

onMounted(async () => {
  await projectStore.fetchProjects()
  await userStore.fetchUsers()
  await loadStoryAndTasks()
})

async function loadStoryAndTasks(): Promise<void> {
  story.value = await storyService.getStory(storyId.value)
  await taskStore.fetchTasksByStory(storyId.value)
}

function tasksForState(state: TaskState): Task[] {
  return taskStore.tasks.filter((task) => task.state === state)
}

function priorityBadgeClass(p: TaskPriority): string {
  if (p === 'high') return 'app-badge-warning'
  if (p === 'medium') return 'app-badge-info'
  return 'bg-app-surface-raised text-app-text-subtle'
}

async function handleCreate(): Promise<void> {
  formError.value = null
  creating.value = true
  try {
    await taskStore.createTask({
      name: name.value,
      description: description.value,
      priority: priority.value,
      storyId: storyId.value,
      estimatedCompletionHours: estimatedCompletionHours.value,
      state: 'todo',
    })
    name.value = ''
    description.value = ''
    priority.value = 'medium'
    estimatedCompletionHours.value = 1
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Failed to create task'
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
        <RouterLink to="/stories" class="hover:text-app-text">Stories</RouterLink>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">{{ story?.name ?? 'Story' }}</span>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">Board</span>
      </nav>
      <h1 class="app-page-title">Task board</h1>
      <p v-if="story" class="app-page-description">
        Kanban view for {{ story.name }}
      </p>
    </div>

    <p
      v-if="!story && !taskStore.loading"
      class="app-panel px-5 py-10 text-center text-sm text-app-text-subtle"
    >
      Story not found.
      <RouterLink to="/stories" class="mt-4 block text-app-primary hover:underline">
        Back to stories
      </RouterLink>
    </p>

    <div v-else class="grid gap-6 xl:grid-cols-4">
      <div class="xl:col-span-3">
        <p v-if="taskStore.loading" class="text-sm text-app-text-subtle">
          Loading board…
        </p>
        <p v-else-if="taskStore.error" class="text-sm text-app-danger">
          {{ taskStore.error }}
        </p>

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="column in columns"
            :key="column.state"
            class="app-kanban-column"
          >
            <div class="app-kanban-column-header">
              <span>{{ column.label }}</span>
              <span class="text-xs font-normal text-app-text-subtle">
                {{ tasksForState(column.state).length }}
              </span>
            </div>

            <div class="flex flex-1 flex-col gap-2 p-2">
              <p
                v-if="tasksForState(column.state).length === 0"
                class="rounded border border-dashed border-app-border px-3 py-6 text-center text-xs text-app-text-subtle"
              >
                No tasks
              </p>

              <RouterLink
                v-for="task in tasksForState(column.state)"
                :key="task.id"
                :to="`/tasks/${task.id}`"
                class="app-kanban-card"
              >
                <h3 class="text-sm font-medium text-app-text">
                  {{ task.name }}
                </h3>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <span class="app-badge" :class="priorityBadgeClass(task.priority)">
                    {{ task.priority }}
                  </span>
                </div>
                <p class="mt-2 text-xs text-app-text-subtle">
                  {{
                    task.assignedUserId
                      ? userStore.getUserDisplayName(task.assignedUserId)
                      : 'Unassigned'
                  }}
                </p>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <form class="app-panel h-fit" @submit.prevent="handleCreate">
        <div class="app-panel-header">Create task</div>
        <div class="space-y-4 p-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-app-text-subtle">
              Name <span class="text-app-danger">*</span>
            </label>
            <input v-model="name" type="text" required class="app-input" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-app-text-subtle">
              Description
            </label>
            <textarea v-model="description" rows="3" class="app-input resize-y" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-app-text-subtle">
              Priority
            </label>
            <select v-model="priority" class="app-input">
              <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-app-text-subtle">
              Estimated time (hours)
            </label>
            <input
              v-model.number="estimatedCompletionHours"
              type="number"
              min="1"
              required
              class="app-input"
            />
          </div>
          <p v-if="formError" class="text-sm text-app-danger">{{ formError }}</p>
          <button type="submit" :disabled="creating" class="app-btn-primary w-full">
            {{ creating ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
