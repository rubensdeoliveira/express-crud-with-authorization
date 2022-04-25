import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'
import IRolesRepository from '../repositories/IRolesRepository'

import Role from '../infra/typeorm/entities/Role'
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'

interface IRequest {
  name: string
  description: string
}

@injectable()
class CreateRoleService {
  constructor(
    @inject('RolesRepository')
    private rolesRepository: IRolesRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider
  ) {}

  public async execute({ name, description }: IRequest): Promise<Role> {
    const checkRoleExists = await this.rolesRepository.findByName(name)
    if (checkRoleExists) {
      throw new AppError('O tipo de usuário já existe na base de dados')
    }

    const role = await this.rolesRepository.create({
      name,
      description
    })

    await this.cacheProvider.invalidate('roles-list')

    return role
  }
}

export default CreateRoleService
