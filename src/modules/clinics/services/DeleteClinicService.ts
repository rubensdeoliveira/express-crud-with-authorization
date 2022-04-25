import AppError from '@shared/errors/AppError'
import { injectable, inject } from 'tsyringe'

import IClinicsRepository from '../repositories/IClinicsRepository'
import IUsersRepository from '@modules/users/repositories/IUsersRepository'
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'

interface IRequest {
  requester_id: string
  clinic_id: string
}

@injectable()
class DeleteClinicService {
  constructor(
    @inject('ClinicsRepository')
    private clinicsRepository: IClinicsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider
  ) {}

  public async execute({ requester_id, clinic_id }: IRequest): Promise<void> {
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
        'Você não tem permissões para excluir uma clínica de outra empresa',
        401
      )
    }

    const usersInClinic = await this.usersRepository.findUsersPerPage({
      clinic_id,
      page: 1,
      requester_id,
      search: ''
    })
    if (usersInClinic.length) {
      throw new AppError(
        'Antes de apagar a clínica transfira os funcionários para outra clínica ou apague-os'
      )
    }

    await this.cacheProvider.invalidate(`clinics-list:${owner.id}`)

    await this.clinicsRepository.delete(clinic_id)
  }
}

export default DeleteClinicService
