import { injectable, inject } from 'tsyringe'

import IClinicsRepository from '../repositories/IClinicsRepository'

import Clinic from '../infra/typeorm/entities/Clinic'
import IUsersRepository from '@modules/users/repositories/IUsersRepository'
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'
import AppError from '@shared/errors/AppError'

interface IRequest {
  name: string
  phone: string
  description: string
  site: string
  requester_id: string
}

@injectable()
class CreateClinicService {
  constructor(
    @inject('ClinicsRepository')
    private clinicsRepository: IClinicsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider
  ) {}

  public async execute({
    name,
    phone,
    description,
    site,
    requester_id
  }: IRequest): Promise<Clinic> {
    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (!owner) {
      throw new AppError('Owner não encontrado', 404)
    }

    const clinic = await this.clinicsRepository.create({
      name,
      phone,
      description,
      site,
      owner_id: owner.id
    })

    await this.cacheProvider.invalidate(`clinics-list:${owner.id}`)

    return clinic
  }
}

export default CreateClinicService
