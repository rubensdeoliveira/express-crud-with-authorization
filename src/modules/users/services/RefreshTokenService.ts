import { injectable, inject } from 'tsyringe'

import { verify, sign } from 'jsonwebtoken'

import AppError from '@shared/errors/AppError'

import IUsersTokensRepository from '../repositories/IUsersTokensRepository'
import authConfig from '@config/auth'
import { addDays } from 'date-fns'
import IUsersRepository from '../repositories/IUsersRepository'

interface IPayload {
  sub: string
  email: string
}

interface ITokenResponse {
  token: string
  refresh_token: string
}

@injectable()
class RefreshTokenService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository
  ) {}

  public async execute(token: string): Promise<ITokenResponse> {
    const {
      secret_token,
      expires_in_token,
      secret_refresh_token,
      expires_in_refresh_token,
      expires_refresh_token_days
    } = authConfig.jwt

    const { email, sub } = verify(token, secret_refresh_token) as IPayload

    const user_id = sub

    const userToken = await this.usersTokensRepository.findByUserIdAndRefreshToken(
      user_id,
      token
    )

    if (!userToken) {
      throw new AppError('Refresh token não existe')
    }

    await this.usersTokensRepository.deleteById(userToken.id)

    const refresh_token = sign({ email }, secret_refresh_token, {
      subject: sub,
      expiresIn: expires_in_refresh_token
    })

    const expires_date = addDays(Date.now(), expires_refresh_token_days)

    await this.usersTokensRepository.create({
      user_id,
      refresh_token,
      expires_date
    })

    const user = await this.usersRepository.findById(user_id)

    const newToken = sign({ roles: user?.roles }, secret_token, {
      subject: user_id,
      expiresIn: expires_in_token
    })

    return {
      refresh_token,
      token: newToken
    }
  }
}

export default RefreshTokenService
