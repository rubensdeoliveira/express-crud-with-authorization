import Clinic from '../infra/typeorm/entities/Clinic'
import ICreateClinicDTO from '../dtos/ICreateClinicDTO'

export default interface IClinicsRepository {
  findClinics(owner_id: string): Promise<Clinic[]>
  findClinicsByClinicIds(clinic_ids: string[]): Promise<Clinic[]>
  checkClinicsExistsByClinicIds(clinics_ids: string[]): Promise<boolean>
  findById(id: string): Promise<Clinic | undefined>
  create(data: ICreateClinicDTO): Promise<Clinic>
  save(clinic: Clinic): Promise<Clinic>
  delete(id: string): Promise<void>
}
