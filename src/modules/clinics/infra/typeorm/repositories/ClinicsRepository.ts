import { getRepository, Repository } from 'typeorm'

import IClinicsRepository from '@modules/clinics/repositories/IClinicsRepository'

import ICreateClinicDTO from '@modules/clinics/dtos/ICreateClinicDTO'

import Clinic from '@modules/clinics/infra/typeorm/entities/Clinic'

class ClinicsRepository implements IClinicsRepository {
  private ormRepository: Repository<Clinic>

  constructor() {
    this.ormRepository = getRepository(Clinic)
  }

  public async findClinics(owner_id: string): Promise<Clinic[]> {
    const clinics = await this.ormRepository.find({
      order: { name: 'ASC' },
      where: {
        owner_id
      }
    })

    return clinics
  }

  public async findById(id: string): Promise<Clinic | undefined> {
    const clinic = await this.ormRepository.findOne(id)

    return clinic
  }

  public async checkClinicsExistsByClinicIds(
    clinics: string[]
  ): Promise<boolean> {
    const promises = clinics.map(
      async clinicId => await this.ormRepository.findOne(clinicId)
    )

    const getClinics = await Promise.all(promises)

    const findAllClinics = getClinics.every(getClinic => !!getClinic)

    return findAllClinics
  }

  public async findClinicsByClinicIds(clinics: string[]): Promise<Clinic[]> {
    const findedClinics: Clinic[] = []

    const promises = clinics.map(
      async clinicId => await this.ormRepository.findOne(clinicId)
    )

    const getClinics = await Promise.all(promises)

    getClinics.forEach(getClinic => {
      if (getClinic) {
        findedClinics.push(getClinic)
      }
    })

    return findedClinics
  }

  public async create(clinicData: ICreateClinicDTO): Promise<Clinic> {
    const clinic = this.ormRepository.create(clinicData)

    await this.ormRepository.save(clinic)

    return clinic
  }

  public async save(clinic: Clinic): Promise<Clinic> {
    return this.ormRepository.save(clinic)
  }

  public async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id)
  }
}

export default ClinicsRepository
