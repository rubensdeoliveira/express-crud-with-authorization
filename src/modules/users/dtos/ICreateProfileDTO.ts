import Role from '@modules/roles/infra/typeorm/entities/Role'

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

export default interface ICreateProfileDTO {
  name: string
  email: string
  birthdate: Date
  phone: string
  cpf?: string
  address: Address
  preferences: Preferences
  password: string
  roles: Role[]
  is_active: boolean
}
