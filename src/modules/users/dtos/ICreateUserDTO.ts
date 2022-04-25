import Role from '@modules/roles/infra/typeorm/entities/Role'
import Clinic from 'modules/clinics/infra/typeorm/entities/Clinic'

interface Address {
  cep?: string
  street?: string
  neighborhood?: string
  number?: string
  city?: string
  state?: string
}

interface Preferences {
  appointmentMinTime?: number
  appointmentMaxTime?: number
}

export default interface ICreateUserDTO {
  name: string
  email: string
  birthdate: Date
  phone: string
  cpf: string
  address: Address
  preferences: Preferences
  password: string
  roles: Role[]
  clinics: Clinic[]
  owner_id: string
  is_active?: boolean
}
