import AppError from '@shared/errors/AppError'

import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider'
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import CreateProfileService from './CreateProfileService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1, fakeUser2 } from '@shared/constants/users'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeHashProvider: FakeHashProvider

let createProfile: CreateProfileService

describe('CreateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeHashProvider = new FakeHashProvider()

    createProfile = new CreateProfileService(
      fakeUsersRepository,
      fakeRolesRepository,
      fakeHashProvider
    )
  })

  it('should be able to create a new profile', async () => {
    await fakeRolesRepository.create(fakeOwnerRole)

    const user = await createProfile.execute(fakeUser1)

    expect(user).toHaveProperty('id')
    expect(user.name).toBe(fakeUser1.name)
    expect(user.roles.length).toBe(1)
    expect(user.roles[0].name).toBe('owner')
  })

  it('should not be able to create a new profile with same email', async () => {
    await fakeRolesRepository.create(fakeOwnerRole)

    await createProfile.execute(fakeUser1)

    await expect(
      createProfile.execute({ ...fakeUser2, email: fakeUser1.email })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to create a new profile if not exists owner role in database', async () => {
    await expect(createProfile.execute(fakeUser1)).rejects.toBeInstanceOf(
      AppError
    )
  })
})
