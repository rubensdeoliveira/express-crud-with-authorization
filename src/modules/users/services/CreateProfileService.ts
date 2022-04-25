import { injectable, inject } from 'tsyringe'
import { addHours } from 'date-fns'

import AppError from '@shared/errors/AppError'
import IUsersRepository from '../repositories/IUsersRepository'
import IHashProvider from '../providers/HashProvider/models/IHashProvider'

import User from '../infra/typeorm/entities/User'
import IRolesRepository from '@modules/roles/repositories/IRolesRepository'

interface IRequest {
  name: string
  email: string
  birthdate: Date
  phone: string
  cpf: string
  password: string
}

@injectable()
class CreateProfileService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('RolesRepository')
    private rolesRepository: IRolesRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  public async execute({
    name,
    email,
    birthdate,
    phone,
    cpf,
    password
  }: IRequest): Promise<User> {
    const checkUserExists = await this.usersRepository.findByEmail(email)
    if (checkUserExists) {
      throw new AppError('O e-mail já existe na base de dados')
    }

    const findOwnerRoleId = await this.rolesRepository.findByName('owner')
    if (!findOwnerRoleId) {
      throw new AppError(
        'Não existe um perfil de usuário do tipo owner no banco'
      )
    }

    const hashedPassword = await this.hashProvider.generateHash(password)

    const user = await this.usersRepository.createProfile({
      name,
      email,
      birthdate: addHours(birthdate, 12),
      phone,
      cpf,
      address: {},
      password: hashedPassword,
      roles: [findOwnerRoleId],
      is_active: true,
      preferences: {}
    })

    return user
  }
}

export default CreateProfileService
