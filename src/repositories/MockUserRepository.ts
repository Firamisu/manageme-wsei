import { MOCK_USERS } from '../data/mockUsers'
import type { User } from '../types/User'
import type { IUserRepository } from './IUserRepository'

export class MockUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    return [...MOCK_USERS]
  }

  async getById(id: string): Promise<User | null> {
    return MOCK_USERS.find((u) => u.id === id) ?? null
  }
}
