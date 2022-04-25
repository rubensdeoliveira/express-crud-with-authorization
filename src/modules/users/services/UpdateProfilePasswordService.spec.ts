import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider'

import UpdateProfilePasswordService from './UpdateProfilePasswordService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeHashProvider: FakeHashProvider

let updateProfilePassword: UpdateProfilePasswordService

describe('UpdateProfilePassword', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeHashProvider = new FakeHashProvider()

    updateProfilePassword = new UpdateProfilePasswordService(
      fakeUsersRepository,
      fakeHashProvider
    )
  })

  it('should be able to update user password', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const updatedUser = await updateProfilePassword.execute({
      user_id: user.id,
      password: 'new-pass',
      old_password: 'edwiges'
    })

    expect(updatedUser.password).toBe('new-pass')
  })

  it('should not be able to update user password if user does not exists', async () => {
    await expect(
      updateProfilePassword.execute({
        user_id: 'inexistent-user',
        password: 'new-pass',
        old_password: 'wrong-pass'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to update user password if old password is wrong', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateProfilePassword.execute({
        user_id: user.id,
        password: 'new-pass',
        old_password: 'wrong-old-pass'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
