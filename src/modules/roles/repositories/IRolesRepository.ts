import Role from '../infra/typeorm/entities/Role'
import ICreateRoleDTO from '../dtos/ICreateRoleDTO'

export default interface IRolesRepository {
  findRoles(): Promise<Role[]>
  findById(id: string): Promise<Role | undefined>
  findByName(name: string): Promise<Role | undefined>
  checkRolesExistsByNames(roles: string[]): Promise<boolean>
  findRolesByNames(roles: string[]): Promise<Role[]>
  create(data: ICreateRoleDTO): Promise<Role>
  save(role: Role): Promise<Role>
  delete(id: string): Promise<void>
}
