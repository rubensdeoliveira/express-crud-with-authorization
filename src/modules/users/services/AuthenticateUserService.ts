import { sign } from 'jsonwebtoken'
import authConfig from '@config/auth'
import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'
import IHashProvider from '../providers/HashProvider/models/IHashProvider'
import IUsersRepository from '../repositories/IUsersRepository'

import User from '../infra/typeorm/entities/User'
import IUsersTokensRepository from '../repositories/IUsersTokensRepository'
import { addDays } from 'date-fns'

interface IRequest {
  email: string
  password: string
}

interface IResponse {
  token: string
  user: User
  refresh_token: string
}

@injectable()
class AuthenticateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new AppError('E-mail ou senha inválidos', 401)
    }

    const passwordMatched = await this.hashProvider.compareHash(
      password,
      user.password
    )
    if (!passwordMatched) {
      throw new AppError('E-mail ou senha inválidos', 401)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(user.id)
    if (!user.is_active || (owner && !owner.is_active)) {
      throw new AppError(
        'Conta temporariamente bloqueada, entre em contato com o suporte para mais detalhes',
        401
      )
    }

    const {
      secret_token,
      expires_in_token,
      secret_refresh_token,
      expires_in_refresh_token,
      expires_refresh_token_days
    } = authConfig.jwt

    const token = sign({ roles: user.roles }, secret_token, {
      subject: user.id,
      expiresIn: expires_in_token
    })

    const refresh_token = sign({ email }, secret_refresh_token, {
      subject: user.id,
      expiresIn: expires_in_refresh_token
    })

    const expires_date = addDays(Date.now(), expires_refresh_token_days)

    await this.usersTokensRepository.create({
      user_id: user.id,
      refresh_token,
      expires_date
    })

    return { token, user, refresh_token }
  }
}

export default AuthenticateUserService
