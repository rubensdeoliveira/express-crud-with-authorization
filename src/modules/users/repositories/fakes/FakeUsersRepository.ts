import { v4 as uuidv4 } from 'uuid'

import IUsersRepository from '@modules/users/repositories/IUsersRepository'
import ICreateUserDTO from '@modules/users/dtos/ICreateUserDTO'
import User from '@modules/users/infra/typeorm/entities/User'
import ICreateProfileDTO from '@modules/users/dtos/ICreateProfileDTO'
import IFindUsersPerPageDTO from '@modules/users/dtos/IFindUsersPerPageDTO'
import ICountUsersDTO from '@modules/users/dtos/ICountUsersDTO'

class FakeUsersRepository implements IUsersRepository {
  private users: User[] = []

  public async findUsersPerPage({
    page,
    search,
    clinic_id,
    requester_id
  }: IFindUsersPerPageDTO): Promise<User[]> {
    const owner = await this.findOwnerByRequesterId(requester_id)
    if (!owner) return this.users

    const findUsers = this.users.filter(
      user =>
        user.owner_id === owner.id &&
        user.id !== owner.id &&
        user.id !== requester_id &&
        user.clinics.find(clinic => clinic.id === clinic_id)
    )

    findUsers.sort((a, b) => (a.name > b.name ? 1 : -1))

    if (search) {
      const filteredFindUsersPaginated = findUsers.filter(findUser => {
        const findUserNameUpper = findUser.name.toUpperCase()
        const findUserEmailUpper = findUser.email.toUpperCase()

        return (
          findUserNameUpper.includes(search.toUpperCase()) ||
          findUserEmailUpper.includes(search.toUpperCase()) ||
          findUser.phone.includes(search) ||
          findUser.cpf.includes(search)
        )
      })

      const findUsersPaginated = filteredFindUsersPaginated.slice(
        (page - 1) * 20,
        (page - 1) * 20 + 20
      )

      return findUsersPaginated
    }

    const findUsersPaginated = findUsers.slice(
      (page - 1) * 20,
      (page - 1) * 20 + 20
    )

    return findUsersPaginated
  }

  public async countUsers({
    search,
    clinic_id,
    requester_id
  }: ICountUsersDTO): Promise<number> {
    const owner = await this.findOwnerByRequesterId(requester_id)
    if (!owner) return 0

    const findUsers = this.users.filter(
      user =>
        user.owner_id === owner.id &&
        user.id !== owner.id &&
        user.id !== requester_id &&
        user.clinics.find(clinic => clinic.id === clinic_id)
    )

    if (search) {
      const filteredFindUsersPaginated = findUsers.filter(findUser => {
        const findUserNameUpper = findUser.name.toUpperCase()
        const findUserEmailUpper = findUser.email.toUpperCase()

        return (
          findUserNameUpper.includes(search.toUpperCase()) ||
          findUserEmailUpper.includes(search.toUpperCase()) ||
          findUser.phone.includes(search) ||
          findUser.cpf.includes(search)
        )
      })

      return filteredFindUsersPaginated.length
    }

    return findUsers.length
  }

  public async findById(id: string): Promise<User | undefined> {
    const findUser = this.users.find(user => user.id === id)

    return findUser
  }

  public async findOwnerByRequesterId(
    requester_id: string
  ): Promise<User | undefined> {
    const user = this.users.find(user => user.id === requester_id)
    if (user && user.owner_id) {
      const owner = this.users.find(u => u.id === user.owner_id)
      return owner
    }

    const checkIfUserIsOwner =
      user && user.roles.some(role => role.name === 'owner')

    return checkIfUserIsOwner ? user : undefined
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const findUser = this.users.find(user => user.email === email)

    return findUser
  }

  public async findUserRolesByUserId(id: string): Promise<string[]> {
    const userRoles: string[] = []

    const findUser = this.users.find(user => user.id === id)
    if (!findUser) return userRoles

    return findUser.roles.map(role => role.name)
  }

  public async create(userData: ICreateUserDTO): Promise<User> {
    const user = new User()

    Object.assign(user, { id: uuidv4() }, userData)

    this.users.push(user)

    return user
  }

  public async createProfile(userData: ICreateProfileDTO): Promise<User> {
    const user = new User()

    Object.assign(user, { id: uuidv4() }, userData)

    this.users.push(user)

    return user
  }

  public async save(user: User): Promise<User> {
    const findIndex = this.users.findIndex(findUser => findUser.id === user.id)

    this.users[findIndex] = user

    return user
  }

  public async delete(id: string): Promise<void> {
    const findIndex = this.users.findIndex(findUser => findUser.id === id)

    this.users.splice(findIndex, 1)
  }
}

export default FakeUsersRepository
