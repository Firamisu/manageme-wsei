<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { Story, StoryPriority, StoryState } from '../types/Story'
import { useProjectStore } from '../stores/project'
import { useStoryStore } from '../stores/story'
import { useUserStore, formatUserName } from '../stores/user'

const projectStore = useProjectStore()
const storyStore = useStoryStore()
const userStore = useUserStore()

const priorities: StoryPriority[] = ['low', 'medium', 'high']
const states: StoryState[] = ['todo', 'doing', 'done']

const formError = ref<string | null>(null)
const saving = ref(false)
const editingId = ref<string | null>(null)

const name = ref('')
const description = ref('')
const priority = ref<StoryPriority>('medium')
const state = ref<StoryState>('todo')
const ownerId = ref('')

onMounted(async () => {
  await projectStore.fetchProjects()
  await userStore.fetchUsers()
  await storyStore.fetchStories()
  setDefaultOwner()
})

function setDefaultOwner(): void {
  if (!ownerId.value && userStore.users.length > 0) {
    ownerId.value = userStore.users[0]!.id
  }
}

watch(
  () => projectStore.activeProjectId,
  async () => {
    editingId.value = null
    resetForm()
    await userStore.fetchUsers()
    await storyStore.fetchStories()
  },
)

function resetForm(): void {
  name.value = ''
  description.value = ''
  priority.value = 'medium'
  state.value = 'todo'
  ownerId.value = ''
  formError.value = null
  setDefaultOwner()
}

function startCreate(): void {
  editingId.value = null
  resetForm()
}

function startEdit(story: Story): void {
  editingId.value = story.id
  name.value = story.name
  description.value = story.description
  priority.value = story.priority
  state.value = story.state
  ownerId.value = story.ownerId
  formError.value = null
}

function priorityBadgeClass(p: StoryPriority): string {
  if (p === 'high') return 'app-badge-warning'
  if (p === 'medium') return 'app-badge-info'
  return 'bg-app-surface-raised text-app-text-subtle'
}

function stateBadgeClass(s: StoryState): string {
  if (s === 'done') return 'app-badge-success'
  if (s === 'doing') return 'app-badge-info'
  return 'bg-app-surface-raised text-app-text-subtle'
}

async function handleSubmit(): Promise<void> {
  formError.value = null
  saving.value = true
  try {
    const input = {
      name: name.value,
      description: description.value,
      priority: priority.value,
      state: state.value,
      ownerId: ownerId.value,
    }
    if (editingId.value) {
      await storyStore.updateStory(editingId.value, input)
    } else {
      await storyStore.createStory(input)
    }
    startCreate()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Failed to save story'
  } finally {
    saving.value = false
  }
}

async function handleDelete(story: Story): Promise<void> {
  if (!confirm(`Delete story "${story.name}"?`)) return
  try {
    await storyStore.deleteStory(story.id)
    if (editingId.value === story.id) {
      startCreate()
    }
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Failed to delete story'
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <nav class="mb-2 text-xs text-app-text-subtle">
        <span>ManageMe</span>
        <span class="mx-1.5">/</span>
        <span v-if="projectStore.activeProject" class="text-app-text">
          {{ projectStore.activeProject.name }}
        </span>
        <span class="mx-1.5">/</span>
        <span class="text-app-text">Stories</span>
      </nav>
      <h1 class="app-page-title">Stories</h1>
      <p class="app-page-description">
        Manage stories for the active project.
      </p>
    </div>

    <div
      v-if="!projectStore.activeProject"
      class="app-panel px-5 py-10 text-center"
    >
      <h2 class="text-base font-medium text-app-text">No active project</h2>
      <p class="mx-auto mt-2 max-w-sm text-sm text-app-text-subtle">
        Select a project before managing stories.
      </p>
      <RouterLink to="/projects" class="app-btn-primary mt-5 inline-flex">
        Choose a project
      </RouterLink>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <div class="app-panel lg:col-span-2">
        <div class="app-panel-header flex items-center justify-between">
          <span>Stories</span>
          <span v-if="!storyStore.loading" class="font-normal text-app-text-subtle">
            {{ storyStore.stories.length }}
          </span>
        </div>

        <p v-if="storyStore.loading" class="px-4 py-8 text-sm text-app-text-subtle">
          Loading stories…
        </p>
        <p v-else-if="storyStore.error" class="px-4 py-8 text-sm text-app-danger">
          {{ storyStore.error }}
        </p>
        <p
          v-else-if="storyStore.stories.length === 0"
          class="px-4 py-10 text-center text-sm text-app-text-subtle"
        >
          No stories yet. Create one using the form.
        </p>

        <ul v-else>
          <li
            v-for="story in storyStore.stories"
            :key="story.id"
            class="app-list-row"
            :class="{ 'app-list-row-active': editingId === story.id }"
          >
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-sm font-medium text-app-text">
                  {{ story.name }}
                </h2>
                <span class="app-badge" :class="priorityBadgeClass(story.priority)">
                  {{ story.priority }}
                </span>
                <span class="app-badge" :class="stateBadgeClass(story.state)">
                  {{ story.state }}
                </span>
              </div>
              <p v-if="story.description" class="mt-0.5 text-xs text-app-text-subtle">
                {{ story.description }}
              </p>
              <p class="mt-1 text-xs text-app-text-subtle">
                Owner: {{ userStore.getUserDisplayName(story.ownerId) }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <RouterLink
                :to="`/stories/${story.id}/tasks`"
                class="app-btn-subtle shrink-0"
              >
                Board
              </RouterLink>
              <button type="button" class="app-btn-subtle" @click="startEdit(story)">
                Edit
              </button>
              <button
                type="button"
                class="rounded border border-app-danger/30 px-3 py-1.5 text-sm font-medium text-app-danger hover:bg-app-danger-bg"
                @click="handleDelete(story)"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>

      <form class="app-panel h-fit" @submit.prevent="handleSubmit">
        <div class="app-panel-header flex items-center justify-between">
          <span>{{ editingId ? 'Edit story' : 'Create story' }}</span>
          <button
            v-if="editingId"
            type="button"
            class="text-xs font-medium text-app-primary hover:underline"
            @click="startCreate"
          >
            Cancel
          </button>
        </div>
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
            <textarea
              v-model="description"
              rows="3"
              class="app-input resize-y"
            />
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
              State
            </label>
            <select v-model="state" class="app-input">
              <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-app-text-subtle">
              Owner <span class="text-app-danger">*</span>
            </label>
            <select v-model="ownerId" required class="app-input" :disabled="userStore.users.length === 0">
              <option v-if="userStore.users.length === 0" disabled value="">
                No users available
              </option>
              <option v-else-if="!ownerId" disabled value="">
                Select owner
              </option>
              <option v-for="user in userStore.users" :key="user.id" :value="user.id">
                {{ formatUserName(user) }} ({{ user.role }})
              </option>
            </select>
          </div>
          <p v-if="formError" class="text-sm text-app-danger">{{ formError }}</p>
          <button
            type="submit"
            :disabled="saving || !ownerId || userStore.users.length === 0"
            class="app-btn-primary w-full"
          >
            {{ saving ? 'Saving…' : editingId ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
