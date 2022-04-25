import IClinicsRepository from '@modules/clinics/repositories/IClinicsRepository'
import ICreateClinicDTO from '@modules/clinics/dtos/ICreateClinicDTO'
import Clinic from '@modules/clinics/infra/typeorm/entities/Clinic'
import { v4 as uuidv4 } from 'uuid'

class FakeClinicsRepository implements IClinicsRepository {
  private clinics: Clinic[] = []

  public async findClinics(owner_id: string): Promise<Clinic[]> {
    const findClinicsByOwner = this.clinics.filter(
      clinic => clinic.owner_id === owner_id
    )

    findClinicsByOwner.sort((a, b) => (a.name > b.name ? 1 : -1))

    return findClinicsByOwner
  }

  public async findClinicsByClinicIds(
    clinics_ids: string[]
  ): Promise<Clinic[]> {
    const findedClinics: Clinic[] = []

    clinics_ids.forEach(clinic_id => {
      const findClinic = this.clinics.find(r => r.id === clinic_id)

      findClinic && findedClinics.push(findClinic)
    })

    return findedClinics
  }

  public async checkClinicsExistsByClinicIds(
    clinics_ids: string[]
  ): Promise<boolean> {
    const existClinics = clinics_ids.every(clinic_id => {
      const findClinic = this.clinics.find(c => c.id === clinic_id)
      return findClinic
    })

    return existClinics
  }

  public async findById(id: string): Promise<Clinic | undefined> {
    const findClinic = this.clinics.find(clinic => clinic.id === id)

    return findClinic
  }

  public async create(clinicData: ICreateClinicDTO): Promise<Clinic> {
    const clinic = new Clinic()

    Object.assign(clinic, { id: uuidv4() }, clinicData)

    this.clinics.push(clinic)

    return clinic
  }

  public async save(clinic: Clinic): Promise<Clinic> {
    const findIndex = this.clinics.findIndex(
      findClinic => findClinic.id === clinic.id
    )

    this.clinics[findIndex] = clinic

    return clinic
  }

  public async delete(id: string): Promise<void> {
    const findIndex = this.clinics.findIndex(findClinic => findClinic.id === id)

    this.clinics.splice(findIndex, 1)
  }
}

export default FakeClinicsRepository
