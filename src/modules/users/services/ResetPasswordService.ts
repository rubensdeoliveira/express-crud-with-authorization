import { injectable, inject } from 'tsyringe'
import { isAfter, addHours } from 'date-fns'

import AppError from '@shared/errors/AppError'
import IUsersRepository from '../repositories/IUsersRepository'
import IHashProvider from '../providers/HashProvider/models/IHashProvider'
import IUsersTokensRepository from '../repositories/IUsersTokensRepository'

interface IRequest {
  password: string
  token: string
}

@injectable()
class ResetPasswordService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  public async execute({ token, password }: IRequest): Promise<void> {
    const userToken = await this.usersTokensRepository.findByRefreshToken(token)
    if (!userToken) {
      throw new AppError('Token de usuário inexistente')
    }

    const user = await this.usersRepository.findById(userToken.user_id)
    if (!user) {
      throw new AppError('Usuário não existente')
    }

    const tokenCreatedAt = userToken.created_at
    const compareDate = addHours(tokenCreatedAt, 2)

    if (isAfter(Date.now(), compareDate)) {
      throw new AppError('Token expirado')
    }

    user.password = await this.hashProvider.generateHash(password)

    await this.usersRepository.save(user)

    await this.usersTokensRepository.deleteById(userToken.id)
  }
}

export default ResetPasswordService
