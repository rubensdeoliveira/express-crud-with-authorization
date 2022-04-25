import { injectable, inject } from 'tsyringe'

import IClinicsRepository from '../repositories/IClinicsRepository'

import IUsersRepository from '@modules/users/repositories/IUsersRepository'
import Clinic from '../infra/typeorm/entities/Clinic'
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'
import AppError from '@shared/errors/AppError'

interface IRequest {
  requester_id: string
}

interface IResponse {
  results: Clinic[]
  total_results: number
}

@injectable()
class ListClinicsService {
  constructor(
    @inject('ClinicsRepository')
    private clinicsRepository: IClinicsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider
  ) {}

  public async execute({ requester_id }: IRequest): Promise<IResponse> {
    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (!owner) {
      throw new AppError('Owner não encontrado', 404)
    }

    let clinics: Clinic[] = []
    if (owner.id === requester_id) {
      clinics = await this.clinicsRepository.findClinics(owner.id)
    } else {
      const user = await this.usersRepository.findById(requester_id)

      if (user) {
        clinics = user.clinics
      }
    }

    return {
      results: clinics,
      total_results: clinics.length
    }
  }
}

export default ListClinicsService
