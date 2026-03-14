export interface User {
  id: string
  firstName: string
  lastName: string
}

export type CreateUserInput = Omit<User, 'id'>
export type UpdateUserInput = Partial<CreateUserInput>
