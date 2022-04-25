import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IHashProvider from '../providers/HashProvider/models/IHashProvider'
import IUsersRepository from '../repositories/IUsersRepository'

import User from '../infra/typeorm/entities/User'

interface IRequest {
  old_password: string
  password: string
  user_id: string
}

@injectable()
class UpdateProfileService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  public async execute({
    old_password,
    password,
    user_id
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id)
    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    const checkOldPassword = await this.hashProvider.compareHash(
      old_password,
      user.password
    )

    if (!checkOldPassword) {
      throw new AppError('Senha antiga incorreta')
    }

    user.password = await this.hashProvider.generateHash(password)

    return this.usersRepository.save(user)
  }
}

export default UpdateProfileService
