import ICreateUsersTokensDTO from '@modules/users/dtos/ICreateUsersTokensDTO'
import IUsersTokensRepository from '@modules/users/repositories/IUsersTokensRepository'
import { getRepository, Repository } from 'typeorm'
import UserToken from '../entities/UserToken'

class UsersTokensRepository implements IUsersTokensRepository {
  private repository: Repository<UserToken>

  constructor() {
    this.repository = getRepository(UserToken)
  }

  async create({
    expires_date,
    refresh_token,
    user_id
  }: ICreateUsersTokensDTO): Promise<UserToken> {
    const userToken = this.repository.create({
      expires_date,
      refresh_token,
      user_id
    })

    await this.repository.save(userToken)

    return userToken
  }

  async findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserToken | undefined> {
    const usersTokens = await this.repository.findOne({
      user_id,
      refresh_token
    })

    return usersTokens
  }

  async findByRefreshToken(
    refresh_token: string
  ): Promise<UserToken | undefined> {
    const userToken = await this.repository.findOne({ refresh_token })

    return userToken
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default UsersTokensRepository
