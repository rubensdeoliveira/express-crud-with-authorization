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

@Entity('user_address')
class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  id: string

  @Column()
  cep: string

  @Column()
  street: string

  @Column()
  neighborhood: string

  @Column()
  number: string

  @Column()
  city: string

  @Column()
  state: string

  @CreateDateColumn()
  @Exclude()
  created_at: Date

  @UpdateDateColumn()
  @Exclude()
  updated_at: Date

  @OneToOne(() => User, (user: User) => user.address)
  public user: User
}

export default UserAddress
