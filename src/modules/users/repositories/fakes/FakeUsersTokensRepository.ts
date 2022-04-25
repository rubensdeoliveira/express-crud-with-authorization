import { v4 as uuidv4 } from 'uuid'

import IUsersTokensRepository from '../IUsersTokensRepository'
import ICreateUsersTokensDTO from '@modules/users/dtos/ICreateUsersTokensDTO'
import UserToken from '@modules/users/infra/typeorm/entities/UserToken'

class FakeUsersTokensRepository implements IUsersTokensRepository {
  private usersTokens: UserToken[] = []

  public async create(
    userTokenData: ICreateUsersTokensDTO
  ): Promise<UserToken> {
    const userToken = new UserToken()

    Object.assign(userToken, { id: uuidv4() }, userTokenData)

    this.usersTokens.push(userToken)

    return userToken
  }

  public async findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserToken | undefined> {
    const userToken = this.usersTokens.find(
      ut => ut.user_id === user_id && ut.refresh_token === refresh_token
    )

    return userToken
  }

  public async findByRefreshToken(
    refresh_token: string
  ): Promise<UserToken | undefined> {
    const userToken = this.usersTokens.find(
      ut => ut.refresh_token === refresh_token
    )

    return userToken
  }

  public async deleteById(id: string): Promise<void> {
    const userToken = this.usersTokens.find(ut => ut.id === id)

    if (userToken) {
      this.usersTokens.splice(this.usersTokens.indexOf(userToken))
    }
  }
}

export default FakeUsersTokensRepository
