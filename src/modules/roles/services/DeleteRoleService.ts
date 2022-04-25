import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'
import AppError from '@shared/errors/AppError'
import { injectable, inject } from 'tsyringe'

import IRolesRepository from '../repositories/IRolesRepository'

interface IRequest {
  role_id: string
}

@injectable()
class DeleteRoleService {
  constructor(
    @inject('RolesRepository')
    private rolesRepository: IRolesRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider
  ) {}

  public async execute({ role_id }: IRequest): Promise<void> {
    const role = await this.rolesRepository.findById(role_id)
    if (!role) {
      throw new AppError('Tipo de usuário não encontrado', 404)
    }

    await this.cacheProvider.invalidate('roles-list')

    await this.rolesRepository.delete(role_id)
  }
}

export default DeleteRoleService
