import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IUsersRepository from '../repositories/IUsersRepository'

import User from '../infra/typeorm/entities/User'

interface IRequest {
  user_id: string
  requester_id: string
}

@injectable()
class ShowUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async execute({ user_id, requester_id }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id)
    if (!user) {
      throw new AppError('Funcionário não encontrado', 404)
    }

    if (user.id === requester_id) {
      throw new AppError(
        'Você está tentando exibir seus próprios dados, utilize outra rota',
        401
      )
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (user.owner_id && owner && user.owner_id !== owner.id) {
      throw new AppError(
        'Você não tem permissões para visualizar o funcionário de outra empresa',
        401
      )
    }

    const userRoles = await this.usersRepository.findUserRolesByUserId(user_id)
    if (userRoles.includes('owner')) {
      throw new AppError(
        'Você não pode visualizar um funcionário do tipo owner',
        401
      )
    }

    return user
  }
}

export default ShowUserService
