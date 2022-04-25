import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IHashProvider from '../providers/HashProvider/models/IHashProvider'
import IUsersRepository from '../repositories/IUsersRepository'

import User from '../infra/typeorm/entities/User'
import { addHours } from 'date-fns'

interface Address {
  cep?: string
  street?: string
  neighborhood?: string
  number?: string
  city?: string
  state?: string
}

interface IRequest {
  name: string
  email: string
  birthdate: Date
  phone: string
  cpf: string
  address: Address
  password?: string
  requester_id: string
  user_id: string
}

@injectable()
class UpdateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  public async execute({
    name,
    email,
    birthdate,
    phone,
    cpf,
    address,
    password,
    requester_id,
    user_id
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id)
    if (!user) {
      throw new AppError('Funcionário não encontrado', 404)
    }

    const userWithUpdatedEmail = await this.usersRepository.findByEmail(email)
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user_id) {
      throw new AppError(
        'O e-mail escolhido para o funcionário já existe na base de dados'
      )
    }

    if (user.id === requester_id) {
      throw new AppError('Você não pode alterar a si mesmo', 401)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (!owner) {
      throw new AppError('Owner não encontrado', 404)
    }

    if (user.owner_id && user.owner_id !== owner.id) {
      throw new AppError(
        'Você não tem permissões para alterar um funcionário de outra empresa',
        401
      )
    }

    const userRoles = await this.usersRepository.findUserRolesByUserId(user_id)
    if (userRoles.includes('owner')) {
      throw new AppError(
        'Você não pode alterar um funcionário do tipo owner',
        401
      )
    }

    user.name = name
    user.email = email
    user.birthdate = addHours(birthdate, 12)
    user.phone = phone
    user.cpf = cpf
    user.address = { ...user.address, ...address }

    if (password) {
      user.password = await this.hashProvider.generateHash(password)
    }

    return this.usersRepository.save(user)
  }
}

export default UpdateUserService
