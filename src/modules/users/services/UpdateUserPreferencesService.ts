import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IUsersRepository from '../repositories/IUsersRepository'

import User from '../infra/typeorm/entities/User'

interface IRequest {
  appointmentMinTime: number
  appointmentMaxTime: number
  user_id: string
  requester_id: string
}

@injectable()
class UpdateUserPreferencesService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async execute({
    appointmentMinTime,
    appointmentMaxTime,
    user_id,
    requester_id
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id)
    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (user.owner_id && owner && user.owner_id !== owner.id) {
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
    if (!userRoles.includes('professional')) {
      throw new AppError(
        'Você só pode alterar as preferências de um profissional',
        401
      )
    }

    if (appointmentMinTime === appointmentMaxTime) {
      throw new AppError(
        'Escolha horas diferentes para o funcionamento do profissional'
      )
    }

    if (appointmentMinTime > appointmentMaxTime) {
      throw new AppError(
        'O horário do fim do expediente deve ser maior que o horário inicial'
      )
    }

    user.preferences = {
      ...user.preferences,
      appointmentMinTime,
      appointmentMaxTime
    }

    return this.usersRepository.save(user)
  }
}

export default UpdateUserPreferencesService
