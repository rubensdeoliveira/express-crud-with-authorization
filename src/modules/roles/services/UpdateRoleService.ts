import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IRolesRepository from '../repositories/IRolesRepository'

import Role from '../infra/typeorm/entities/Role'
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'

interface IRequest {
  role_id: string
  name: string
  description: string
}

@injectable()
class UpdateRoleService {
  constructor(
    @inject('RolesRepository')
    private rolesRepository: IRolesRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider
  ) {}

  public async execute({
    role_id,
    name,
    description
  }: IRequest): Promise<Role> {
    const role = await this.rolesRepository.findById(role_id)
    if (!role) {
      throw new AppError('Tipo de usuário não encontrado', 404)
    }

    await this.cacheProvider.invalidate('roles-list')

    return this.rolesRepository.save({ ...role, name, description })
  }
}

export default UpdateRoleService
