import User from '../infra/typeorm/entities/User'
import ICreateUserDTO from '../dtos/ICreateUserDTO'
import ICreateProfileDTO from '../dtos/ICreateProfileDTO'
import IFindUsersPerPageDTO from '../dtos/IFindUsersPerPageDTO'
import ICountUsersDTO from '../dtos/ICountUsersDTO'

export default interface IUsersRepository {
  findUsersPerPage(data: IFindUsersPerPageDTO): Promise<User[]>
  countUsers(data: ICountUsersDTO): Promise<number>
  findById(id: string): Promise<User | undefined>
  findOwnerByRequesterId(requester_id: string): Promise<User | undefined>
  findUserRolesByUserId(id: string): Promise<string[]>
  findByEmail(email: string): Promise<User | undefined>
  create(data: ICreateUserDTO): Promise<User>
  createProfile(data: ICreateProfileDTO): Promise<User>
  save(user: User): Promise<User>
}
