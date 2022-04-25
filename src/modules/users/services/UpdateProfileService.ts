import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IUsersRepository from '../repositories/IUsersRepository'

import User from '../infra/typeorm/entities/User'
import { addHours } from 'date-fns'

interface Address {
  cep: string
  street: string
  neighborhood: string
  number: string
  city: string
  state: string
}

interface IRequest {
  name: string
  email: string
  birthdate: Date
  cpf: string
  phone: string
  address: Address
  user_id: string
}

@injectable()
class UpdateProfileService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async execute({
    name,
    email,
    birthdate,
    cpf,
    phone,
    address,
    user_id
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id)
    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    const userWithUpdatedEmail = await this.usersRepository.findByEmail(email)
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user_id) {
      throw new AppError('O e-mail passado já existe na base de dados')
    }

    user.name = name
    user.email = email
    user.birthdate = addHours(birthdate, 12)
    user.cpf = cpf
    user.phone = phone
    user.address = { ...user.address, ...address }

    return this.usersRepository.save(user)
  }
}

export default UpdateProfileService
