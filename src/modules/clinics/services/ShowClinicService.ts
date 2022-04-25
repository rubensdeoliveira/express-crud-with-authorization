import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IClinicsRepository from '../repositories/IClinicsRepository'
import IUsersRepository from '@modules/users/repositories/IUsersRepository'

import Clinic from '../infra/typeorm/entities/Clinic'

interface IRequest {
  clinic_id: string
  requester_id: string
}

@injectable()
class ShowClinicService {
  constructor(
    @inject('ClinicsRepository')
    private clinicsRepository: IClinicsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async execute({ clinic_id, requester_id }: IRequest): Promise<Clinic> {
    const clinic = await this.clinicsRepository.findById(clinic_id)
    if (!clinic) {
      throw new AppError('Clínica não encontrada', 404)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (owner && clinic.owner_id !== owner.id) {
      throw new AppError(
        'Você não tem permissões para visualizar uma clínica de outra empresa',
        401
      )
    }

    return clinic
  }
}

export default ShowClinicService
