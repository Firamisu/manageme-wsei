export type UserRole = 'admin' | 'devops' | 'developer'

export interface User {
  id: string
  firstName: string
  lastName: string
  role: UserRole
}

export type CreateUserInput = Omit<User, 'id'>
export type UpdateUserInput = Partial<CreateUserInput>
