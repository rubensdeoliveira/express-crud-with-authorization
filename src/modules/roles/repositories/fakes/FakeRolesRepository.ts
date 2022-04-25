import { v4 as uuidv4 } from 'uuid'

import IRolesRepository from '@modules/roles/repositories/IRolesRepository'
import ICreateRoleDTO from '@modules/roles/dtos/ICreateRoleDTO'
import Role from '@modules/roles/infra/typeorm/entities/Role'

class FakeRolesRepository implements IRolesRepository {
  private rolesArray: Role[] = []

  public async findRoles(): Promise<Role[]> {
    const filteredRoles = this.rolesArray.filter(
      role => role.name !== 'owner' && role.name !== 'system'
    )
    filteredRoles.sort((a, b) => (a.name > b.name ? 1 : -1))

    return filteredRoles
  }

  public async findById(id: string): Promise<Role | undefined> {
    const findRole = this.rolesArray.find(role => role.id === id)

    return findRole
  }

  public async findByName(name: string): Promise<Role | undefined> {
    const findRole = this.rolesArray.find(role => role.name === name)

    return findRole
  }

  public async checkRolesExistsByNames(roles: string[]): Promise<boolean> {
    const existRoles = roles.every(role => {
      const findRole = this.rolesArray.find(r => r.name === role)
      return findRole
    })

    return existRoles
  }

  public async findRolesByNames(roles: string[]): Promise<Role[]> {
    const findedRoles: Role[] = []

    roles.forEach(role => {
      const findRole = this.rolesArray.find(r => r.name === role)

      findRole && findedRoles.push(findRole)
    })

    return findedRoles
  }

  public async create(roleData: ICreateRoleDTO): Promise<Role> {
    const role = new Role()

    Object.assign(role, { id: uuidv4() }, roleData)

    this.rolesArray.push(role)

    return role
  }

  public async save(role: Role): Promise<Role> {
    const findIndex = this.rolesArray.findIndex(
      findRole => findRole.id === role.id
    )

    this.rolesArray[findIndex] = role

    return role
  }

  public async delete(id: string): Promise<void> {
    const findIndex = this.rolesArray.findIndex(findRole => findRole.id === id)

    this.rolesArray.splice(findIndex, 1)
  }
}

export default FakeRolesRepository
