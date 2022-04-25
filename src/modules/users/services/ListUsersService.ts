import { injectable, inject } from 'tsyringe'

import IUsersRepository from '../repositories/IUsersRepository'

import IClinicsRepository from '@modules/clinics/repositories/IClinicsRepository'
import AppError from '@shared/errors/AppError'
import User from '../infra/typeorm/entities/User'

interface IRequest {
  requester_id: string
  page: number
  search: string
  clinic_id: string
}

interface IResponse {
  page: number
  results: User[]
  total_results: number
  total_pages: number
}

@injectable()
class ListUsersService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('ClinicsRepository')
    private clinicsRepository: IClinicsRepository
  ) {}

  public async execute({
    requester_id,
    page,
    search,
    clinic_id
  }: IRequest): Promise<IResponse> {
    const clinic = await this.clinicsRepository.findById(clinic_id)
    if (!clinic) {
      throw new AppError('Clínica não encontrada', 404)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (owner && clinic.owner_id !== owner.id) {
      throw new AppError(
        'Você não tem permissão para listar os usuários da clínica passada',
        401
      )
    }

    const users = await this.usersRepository.findUsersPerPage({
      requester_id,
      page,
      search,
      clinic_id
    })

    const total_results = await this.usersRepository.countUsers({
      search,
      clinic_id,
      requester_id
    })

    return {
      page,
      results: users,
      total_results,
      total_pages: Math.ceil(total_results / 20)
    }
  }
}

export default ListUsersService
