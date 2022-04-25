import { container } from 'tsyringe'

import '@modules/users/providers'
import './providers'

import IUsersRepository from '@modules/users/repositories/IUsersRepository'
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository'

import IUsersTokensRepository from '@modules/users/repositories/IUsersTokensRepository'
import UsersTokensRepository from '@modules/users/infra/typeorm/repositories/UsersTokensRepository'

import IRolesRepository from '@modules/roles/repositories/IRolesRepository'
import RolesRepository from '@modules/roles/infra/typeorm/repositories/RolesRepository'

import IClinicsRepository from '@modules/clinics/repositories/IClinicsRepository'
import ClinicsRepository from '@modules/clinics/infra/typeorm/repositories/ClinicsRepository'

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository
)

container.registerSingleton<IUsersTokensRepository>(
  'UsersTokensRepository',
  UsersTokensRepository
)

container.registerSingleton<IRolesRepository>(
  'RolesRepository',
  RolesRepository
)

container.registerSingleton<IClinicsRepository>(
  'ClinicsRepository',
  ClinicsRepository
)
