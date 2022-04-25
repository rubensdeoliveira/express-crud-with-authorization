import { getRepository, ILike, Repository } from 'typeorm'

import IUsersRepository from '@modules/users/repositories/IUsersRepository'
import ICreateUserDTO from '@modules/users/dtos/ICreateUserDTO'

import User from '@modules/users/infra/typeorm/entities/User'
import ICreateProfileDTO from '@modules/users/dtos/ICreateProfileDTO'
import IFindUsersPerPageDTO from '@modules/users/dtos/IFindUsersPerPageDTO'
import ICountUsersDTO from '@modules/users/dtos/ICountUsersDTO'

class UsersRepository implements IUsersRepository {
  private ormRepository: Repository<User>

  constructor() {
    this.ormRepository = getRepository(User)
  }

  public async findUsersPerPage({
    requester_id,
    page,
    search,
    clinic_id
  }: IFindUsersPerPageDTO): Promise<User[]> {
    let users: User[] = []

    const resultsPerPage = 20
    const rowsToSkip = (page - 1) * resultsPerPage

    const owner = await this.findOwnerByRequesterId(requester_id)
    if (!owner) return users

    users = await this.ormRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.roles', 'roles')
      .where(
        'users.owner_id = :ownerId and users.id <> :requesterId and users.id <> :ownerId and (users.name ilike :search or users.email ilike :search or users.phone like :search or users.cpf like :search)',
        {
          search: `%${search}%`,
          ownerId: owner.id,
          requesterId: requester_id
        }
      )
      .innerJoin('users.clinics', 'clinic', 'clinic.id = :clinicId', {
        clinicId: clinic_id
      })
      .skip(rowsToSkip)
      .take(resultsPerPage)
      .orderBy('users.name')
      .getMany()

    return users
  }

  public async countUsers({
    requester_id,
    search,
    clinic_id
  }: ICountUsersDTO): Promise<number> {
    let usersCount = 0

    const owner = await this.findOwnerByRequesterId(requester_id)
    if (!owner) return usersCount

    usersCount = await this.ormRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.roles', 'roles')
      .where(
        'users.owner_id = :ownerId and users.id <> :requesterId and users.id <> :ownerId and (users.name ilike :search or users.email ilike :search or users.phone like :search or users.cpf like :search)',
        {
          search: `%${search}%`,
          ownerId: owner.id,
          requesterId: requester_id
        }
      )
      .innerJoin('users.clinics', 'clinic', 'clinic.id = :clinicId', {
        clinicId: clinic_id
      })
      .getCount()

    return usersCount
  }

  public async findById(id: string): Promise<User | undefined> {
    const user = await this.ormRepository.findOne(id, {
      relations: ['roles', 'clinics', 'address', 'preferences']
    })

    return user
  }

  public async findOwnerByRequesterId(
    requester_id: string
  ): Promise<User | undefined> {
    const user = await this.ormRepository.findOne(requester_id, {
      relations: ['roles']
    })

    if (!user) return undefined

    if (user.owner_id) {
      const owner = await this.ormRepository.findOne(user.owner_id)
      return owner
    }

    const checkIsUserIsOwner = user.roles.some(role => role.name === 'owner')

    return checkIsUserIsOwner ? user : undefined
  }

  public async findUserRolesByUserId(id: string): Promise<string[]> {
    let userRoles: string[] = []

    const user = await this.ormRepository.findOne(id, {
      relations: ['roles']
    })

    if (!user) return userRoles

    userRoles = user.roles.map(role => role.name)

    return userRoles
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.ormRepository.findOne({
      where: { email: ILike(email) },
      relations: ['roles']
    })

    return user
  }

  public async create(userData: ICreateUserDTO): Promise<User> {
    const user = this.ormRepository.create({
      ...userData,
      email: userData.email.toLowerCase()
    })

    await this.ormRepository.save(user)

    return user
  }

  public async createProfile(userData: ICreateProfileDTO): Promise<User> {
    const user = this.ormRepository.create({
      ...userData,
      email: userData.email.toLowerCase()
    })

    await this.ormRepository.save(user)

    return user
  }

  public async save(user: User): Promise<User> {
    return this.ormRepository.save({
      ...user,
      email: user.email.toLowerCase()
    })
  }
}

export default UsersRepository
