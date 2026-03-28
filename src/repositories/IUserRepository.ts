import type { User } from '../types/User'

export interface IUserRepository {
  getAll(): Promise<User[]>
  getById(id: string): Promise<User | null>
}
