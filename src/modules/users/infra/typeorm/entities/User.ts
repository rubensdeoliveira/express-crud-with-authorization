import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToOne
} from 'typeorm'

import { Exclude, Expose } from 'class-transformer'
import Role from '@modules/roles/infra/typeorm/entities/Role'
import Clinic from '@modules/clinics/infra/typeorm/entities/Clinic'
import UserAddress from './UserAddress'
import UserPreferences from './UserPreferences'

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  email: string

  @Column('date')
  birthdate: Date

  @Column()
  phone: string

  @Column()
  cpf: string

  @Column()
  @Exclude()
  password: string

  @Column()
  avatar: string

  @Column('boolean')
  is_active: boolean

  @Column()
  owner_id: string

  @CreateDateColumn()
  @Exclude()
  created_at: Date

  @UpdateDateColumn()
  @Exclude()
  updated_at: Date

  @Expose({ name: 'avatar_url' })
  getAvatarUrl(): string | null {
    return this.avatar
      ? `${process.env.APP_API_URL}/files/${this.avatar}`
      : null
  }

  @Expose({ name: 'situation' })
  getSituationStatus(): string {
    return this.is_active ? 'Ativo' : 'Bloqueado'
  }

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'users_roles',
    joinColumns: [{ name: 'user_id' }],
    inverseJoinColumns: [{ name: 'role_id' }]
  })
  roles: Role[]

  @ManyToMany(() => Clinic)
  @JoinTable({
    name: 'users_clinics',
    joinColumns: [{ name: 'user_id' }],
    inverseJoinColumns: [{ name: 'clinic_id' }]
  })
  clinics: Clinic[]

  @OneToOne(() => UserAddress, (address: UserAddress) => address.user, {
    cascade: true
  })
  @JoinColumn({ name: 'address_id' })
  public address: UserAddress

  @OneToOne(
    () => UserPreferences,
    (preferences: UserPreferences) => preferences.user,
    {
      cascade: true
    }
  )
  @JoinColumn({ name: 'preferences_id' })
  public preferences: UserPreferences
}

export default User
