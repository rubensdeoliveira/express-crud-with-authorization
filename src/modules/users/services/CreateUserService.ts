import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'
import IUsersRepository from '../repositories/IUsersRepository'
import IHashProvider from '../providers/HashProvider/models/IHashProvider'

import User from '../infra/typeorm/entities/User'
import IRolesRepository from '@modules/roles/repositories/IRolesRepository'
import { addHours } from 'date-fns'
import IClinicsRepository from '@modules/clinics/repositories/IClinicsRepository'

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
  phone: string
  cpf: string
  address: Address
  password: string
  roles: string[]
  clinic_id: string
  requester_id: string
}

@injectable()
class CreateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('RolesRepository')
    private rolesRepository: IRolesRepository,

    @inject('ClinicsRepository')
    private clinicsRepository: IClinicsRepository,

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
    roles,
    clinic_id,
    requester_id
  }: IRequest): Promise<User> {
    const clinic_ids = [clinic_id]

    const checkUserExists = await this.usersRepository.findByEmail(email)
    if (checkUserExists) {
      throw new AppError('O e-mail já existe na base de dados')
    }

    const checkRolesExists = await this.rolesRepository.checkRolesExistsByNames(
      roles
    )
    if (!checkRolesExists) {
      throw new AppError('Os tipos de usuário passados são inválidos')
    }

    const findNotAllowedRoles = roles.find(
      roleName => roleName === 'owner' || roleName === 'system'
    )
    if (findNotAllowedRoles) {
      throw new AppError('Você não pode criar um usuário do tipo owner')
    }

    const checkExistClinics = await this.clinicsRepository.checkClinicsExistsByClinicIds(
      clinic_ids
    )
    if (!checkExistClinics) {
      throw new AppError('A clínica passada não existe')
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (!owner) {
      throw new AppError('Owner não encontrado', 404)
    }

    const getClinics = await this.clinicsRepository.findClinicsByClinicIds(
      clinic_ids
    )
    getClinics.forEach(clinic => {
      if (clinic.owner_id !== owner.id) {
        throw new AppError(
          'Você não tem permissão para adicionar o usuário na clínica passada',
          401
        )
      }
    })

    const getRoles = await this.rolesRepository.findRolesByNames(roles)
    const hashedPassword = await this.hashProvider.generateHash(password)

    const user = await this.usersRepository.create({
      name,
      email,
      birthdate: addHours(birthdate, 12),
      phone,
      cpf,
      address,
      preferences: {},
      password: hashedPassword,
      roles: getRoles,
      clinics: getClinics,
      owner_id: owner.id
    })

    return user
  }
}

export default CreateUserService
