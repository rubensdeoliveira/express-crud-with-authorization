import { Exclude } from 'class-transformer'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne
} from 'typeorm'
import User from './User'

@Entity('user_preferences')
class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  id: string

  @Column('int')
  appointmentMinTime: number

  @Column('int')
  appointmentMaxTime: number

  @CreateDateColumn()
  @Exclude()
  created_at: Date

  @UpdateDateColumn()
  @Exclude()
  updated_at: Date

  @OneToOne(() => User, (user: User) => user.address)
  public user: User
}

export default UserPreferences
