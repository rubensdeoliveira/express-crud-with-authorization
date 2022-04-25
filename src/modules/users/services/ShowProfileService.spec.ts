import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import ShowProfileService from './ShowProfileService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository

let showProfile: ShowProfileService

describe('ShowProfile', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()

    showProfile = new ShowProfileService(fakeUsersRepository)
  })

  it('should be able to show user profile', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const profile = await showProfile.execute({
      user_id: user.id
    })

    expect(profile.name).toBe(fakeUser1.name)
    expect(profile.email).toBe(fakeUser1.email)
    expect(profile.address.street).toBe(fakeUser1.address.street)
  })

  it('should not be able to show user profile from non-existing user', async () => {
    await expect(
      showProfile.execute({ user_id: 'non-existing-user-id' })
    ).rejects.toBeInstanceOf(AppError)
  })
})
