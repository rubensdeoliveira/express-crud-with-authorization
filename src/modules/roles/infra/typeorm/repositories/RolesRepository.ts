import { Equal, getRepository, Not, Repository } from 'typeorm'

import IRolesRepository from '@modules/roles/repositories/IRolesRepository'

import Role from '@modules/roles/infra/typeorm/entities/Role'

import ICreateRoleDTO from '@modules/roles/dtos/ICreateRoleDTO'

class RolesRepository implements IRolesRepository {
  private ormRepository: Repository<Role>

  constructor() {
    this.ormRepository = getRepository(Role)
  }

  public async findRoles(): Promise<Role[]> {
    const roles = await this.ormRepository
      .createQueryBuilder('roles')
      .where('roles.name <> :owner and roles.name <> :system', {
        owner: 'owner',
        system: 'system'
      })
      .orderBy('roles.name')
      .getMany()

    return roles
  }

  public async findById(id: string): Promise<Role | undefined> {
    const role = await this.ormRepository.findOne(id)

    return role
  }

  public async findByName(name: string): Promise<Role | undefined> {
    const role = await this.ormRepository.findOne({ where: { name } })

    return role
  }

  public async checkRolesExistsByNames(roles: string[]): Promise<boolean> {
    const promises = roles.map(
      async roleName =>
        await this.ormRepository.findOne({
          where: { name: roleName }
        })
    )

    const getRoles = await Promise.all(promises)

    const findAllRoles = getRoles.every(getRole => !!getRole)

    return findAllRoles
  }

  public async findRolesByNames(roles: string[]): Promise<Role[]> {
    const findedRoles: Role[] = []

    const promises = roles.map(
      async roleName =>
        await this.ormRepository.findOne({
          where: { name: roleName }
        })
    )

    const getRoles = await Promise.all(promises)

    getRoles.forEach(getRole => {
      if (getRole) {
        findedRoles.push(getRole)
      }
    })

    return findedRoles
  }

  public async create(roleData: ICreateRoleDTO): Promise<Role> {
    const role = this.ormRepository.create(roleData)

    await this.ormRepository.save(role)

    return role
  }

  public async save(role: Role): Promise<Role> {
    return this.ormRepository.save(role)
  }

  public async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id)
  }
}

export default RolesRepository
