import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'
import FakeStorageProvider from '@shared/container/providers/StorageProvider/fakes/FakeStorageProvider'
import UpdateUserAvatarService from './UpdateProfileAvatarService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeStorageProvider: FakeStorageProvider

let updateUserAvatar: UpdateUserAvatarService

describe('UpdateProfileAvatar', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeStorageProvider = new FakeStorageProvider()

    updateUserAvatar = new UpdateUserAvatarService(
      fakeUsersRepository,
      fakeStorageProvider
    )
  })

  it('should be able to update user avatar', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFilename: 'avatar.jpg'
    })

    expect(user.avatar).toBe('avatar.jpg')
  })

  it('should not be able to update avatar from non existing user', async () => {
    await expect(
      updateUserAvatar.execute({
        user_id: 'non-existing-user',
        avatarFilename: 'avatar.jpg'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should delete old avatar when updating new one', async () => {
    const deleteFile = jest.spyOn(fakeStorageProvider, 'deleteFile')

    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFilename: 'avatar.jpg'
    })

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFilename: 'avatar2.jpg'
    })

    expect(deleteFile).toHaveBeenCalledWith('avatar.jpg')
    expect(user.avatar).toBe('avatar2.jpg')
  })
})
