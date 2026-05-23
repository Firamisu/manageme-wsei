import type { User } from '../types/User'

export const LOGGED_IN_USER_ID = 'user-admin'

export const MOCK_USERS: User[] = [
  {
    id: LOGGED_IN_USER_ID,
    firstName: 'Anna',
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
