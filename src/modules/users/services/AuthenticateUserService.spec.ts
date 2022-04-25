import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider'

import AuthenticateUserService from './AuthenticateUserService'
import { fakeUser1, fakeUser2 } from '@shared/constants/users'
import { fakeAdminRole, fakeOwnerRole } from '@shared/constants/roles'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'
import FakeUsersTokensRepository from '../repositories/fakes/FakeUsersTokensRepository'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeClinicsRepository: FakeClinicsRepository
let fakeHashProvider: FakeHashProvider
let fakeUsersTokensRepository: FakeUsersTokensRepository

let authenticateUser: AuthenticateUserService

describe('AuthenticateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeHashProvider = new FakeHashProvider()
    fakeUsersTokensRepository = new FakeUsersTokensRepository()

    authenticateUser = new AuthenticateUserService(
      fakeUsersRepository,
      fakeUsersTokensRepository,
      fakeHashProvider
    )
  })

  it('should be able to authenticate', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const response = await authenticateUser.execute({
      email: fakeUser1.email,
      password: fakeUser1.password
    })

    expect(response).toHaveProperty('token')
    expect(response.user).toEqual(user)
  })

  it('should not be able to authenticate with non existing user', async () => {
    await expect(
      authenticateUser.execute({
        email: 'non-existing-user-email@gmail.com',
        password: 'non-existing-user-password'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      authenticateUser.execute({
        email: fakeUser1.email,
        password: 'wrong-pass'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to authenticate if user is blocked', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: false,
      roles: [ownerRole]
    })

    await expect(
      authenticateUser.execute({
        email: fakeUser1.email,
        password: fakeUser1.password
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to authenticate if owner is blocked', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const adminRole = await fakeRolesRepository.create(fakeAdminRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: false,
      roles: [ownerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [adminRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    await expect(
      authenticateUser.execute({
        email: fakeUser2.email,
        password: fakeUser2.password
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
