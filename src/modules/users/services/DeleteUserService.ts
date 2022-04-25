import AppError from '@shared/errors/AppError'
import { injectable, inject } from 'tsyringe'

import IUsersRepository from '../repositories/IUsersRepository'

interface IRequest {
  requester_id: string
  user_id: string
}

@injectable()
class DeleteUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async execute({ requester_id, user_id }: IRequest): Promise<void> {
    const user = await this.usersRepository.findById(user_id)
    if (!user) {
      throw new AppError('Funcionário não encontrado', 404)
    }

    if (user.id === requester_id) {
      throw new AppError('Você não pode bloquear/desbloquear a si mesmo', 401)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (user.owner_id && owner && user.owner_id !== owner.id) {
      throw new AppError(
        'Você não tem permissões para bloquear/desbloquear um funcionário de outra empresa',
        401
      )
    }

    const userRoles = await this.usersRepository.findUserRolesByUserId(user_id)
    if (userRoles.includes('owner')) {
      throw new AppError(
        'Você não tem permissões para bloquear/desbloquear um funcionário do tipo owner',
        401
      )
    }

    user.is_active = !user.is_active

    await this.usersRepository.save(user)
  }
}

export default DeleteUserService
