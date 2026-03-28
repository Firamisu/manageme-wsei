import type { User } from '../types/User'
import type { IUserRepository } from '../repositories/IUserRepository'
import { MockUserRepository } from '../repositories/MockUserRepository'

export class UserService {
  private repository: IUserRepository

  constructor(repository?: IUserRepository) {
    this.repository = repository || new MockUserRepository()
  }

  async getAllUsers(): Promise<User[]> {
    return this.repository.getAll()
  }

  async getUser(id: string): Promise<User | null> {
    if (!id) {
      throw new Error('User ID is required')
    }
    return this.repository.getById(id)
  }
}

export const userService = new UserService()
