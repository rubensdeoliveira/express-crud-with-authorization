import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IUsersRepository from '../repositories/IUsersRepository'

import User from '../infra/typeorm/entities/User'
import IRolesRepository from '@modules/roles/repositories/IRolesRepository'

interface IRequest {
  roles: string[]
  user_id: string
  requester_id: string
}

@injectable()
class UpdateUserRolesService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('RolesRepository')
    private rolesRepository: IRolesRepository
  ) {}

  public async execute({
    roles,
    user_id,
    requester_id
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id)
    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    if (user.id === requester_id) {
      throw new AppError('Você não pode alterar a si mesmo', 401)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (user.owner_id && owner && user.owner_id !== owner.id) {
      throw new AppError(
        'Você não tem permissões para alterar um funcionário de outra empresa',
        401
      )
    }

    const userRoles = await this.usersRepository.findUserRolesByUserId(user_id)
    if (userRoles.includes('owner')) {
      throw new AppError(
        'Você não pode alterar um funcionário do tipo owner',
        401
      )
    }

    const checkExistRoles = await this.rolesRepository.checkRolesExistsByNames(
      roles
    )
    if (!checkExistRoles) {
      throw new AppError('Os tipos de usuário passados são inválidos')
    }

    const findNotAllowedRoles = roles.find(
      roleName => roleName === 'owner' || roleName === 'system'
    )
    if (findNotAllowedRoles) {
      throw new AppError(
        'Você não pode alterar um usuário para o tipo owner',
        401
      )
    }

    const getRoles = await this.rolesRepository.findRolesByNames(roles)

    user.roles = getRoles

    return this.usersRepository.save(user)
  }
}

export default UpdateUserRolesService
