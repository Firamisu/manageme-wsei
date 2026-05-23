import type { User } from '../types/User'

export const LOGGED_IN_USER_ID = 'user-admin'

export const MOCK_USERS: User[] = [
  {
    id: 'user-admin',
    firstName: 'Genowefy',
    lastName: 'Admin',
    role: 'admin',
  },
  {
    id: 'user-developer',
    firstName: 'Rajesh',
    lastName: 'Developer',
    role: 'developer',
  },
  {
    id: 'user-devops',
    firstName: 'Zbychu',
    lastName: 'DevOps',
    role: 'devops',
  },
]
