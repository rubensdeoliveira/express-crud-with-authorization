import { injectable, inject } from 'tsyringe'

import IRolesRepository from '../repositories/IRolesRepository'

import Role from '../infra/typeorm/entities/Role'
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'

interface IResponse {
  results: Role[]
  total_results: number
}

@injectable()
class ListRolesService {
  constructor(
    @inject('RolesRepository')
    private rolesRepository: IRolesRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider
  ) {}

  public async execute(): Promise<IResponse> {
    const cacheKey = 'roles-list'

    let roles = await this.cacheProvider.recover<Role[]>(cacheKey)

    if (!roles) {
      roles = await this.rolesRepository.findRoles()

      await this.cacheProvider.save(cacheKey, roles)
    }

    return {
      results: roles,
      total_results: roles.length
    }
  }
}

export default ListRolesService
