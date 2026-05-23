import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/projects',
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectListView.vue'),
    },
    {
      path: '/stories',
      name: 'stories',
      component: () => import('../views/StoryListView.vue'),
    },
    {
      path: '/stories/:storyId/tasks',
      name: 'story-tasks',
      component: () => import('../views/StoryTasksView.vue'),
    },
    {
      path: '/tasks/:id',
      name: 'task-detail',
      component: () => import('../views/TaskDetailView.vue'),
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationListView.vue'),
    },
    {
      path: '/notifications/:id',
      name: 'notification-detail',
      component: () => import('../views/NotificationDetailView.vue'),
    },
  ],
})

export default router
