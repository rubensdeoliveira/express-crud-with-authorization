import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import UpdateProfileService from './UpdateProfileService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1, fakeUser2 } from '@shared/constants/users'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository

let updateProfile: UpdateProfileService

describe('UpdateProfile', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()

    updateProfile = new UpdateProfileService(fakeUsersRepository)
  })

  it('should be able to update user profile', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const updatedUser = await updateProfile.execute({
      name: 'Harryzinho',
      email: 'potterzinho@gmail.com',
      birthdate: new Date('1980-07-31'),
      phone: '(84) 99999-7777',
      cpf: '111.111.111-11',
      address: {
        cep: '11111-111',
        street: 'Rua dos Alfineiros',
        neighborhood: 'Little Whinging',
        number: '4',
        city: 'Londres',
        state: 'RN'
      },
      user_id: user.id
    })

    expect(updatedUser.name).toBe('Harryzinho')
    expect(updatedUser.email).toBe('potterzinho@gmail.com')
    expect(updatedUser.address.street).toBe('Rua dos Alfineiros')
  })

  it('should not be able to update profile from non-existing user', async () => {
    await expect(
      updateProfile.execute({
        ...fakeUser1,
        user_id: 'non-existing-user'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to change user email if new email already exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser2,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateProfile.execute({
        ...fakeUser2,
        user_id: user.id,
        email: fakeUser1.email
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
