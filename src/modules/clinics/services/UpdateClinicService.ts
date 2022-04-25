import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IClinicsRepository from '../repositories/IClinicsRepository'

import Clinic from '../infra/typeorm/entities/Clinic'
import IUsersRepository from '@modules/users/repositories/IUsersRepository'
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'

interface IRequest {
  name: string
  phone: string
  description: string
  site: string
  requester_id: string
  clinic_id: string
}

@injectable()
class UpdateClinicService {
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
    requester_id,
    clinic_id
  }: IRequest): Promise<Clinic> {
    const clinic = await this.clinicsRepository.findById(clinic_id)
    if (!clinic) {
      throw new AppError('Clínica não encontrada', 404)
    }

    const owner = await this.usersRepository.findOwnerByRequesterId(
      requester_id
    )
    if (!owner) {
      throw new AppError('Owner não encontrado', 404)
    }

    if (clinic.owner_id !== owner.id) {
      throw new AppError(
        'Você não tem permissões para alterar uma clínica de outra empresa',
        401
      )
    }

    await this.cacheProvider.invalidate(`clinics-list:${owner.id}`)

    return this.clinicsRepository.save({
      ...clinic,
      name,
      phone,
      description,
      site
    })
  }
}

export default UpdateClinicService
