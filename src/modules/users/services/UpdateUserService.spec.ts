import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider'

import UpdateUserService from './UpdateUserService'
import {
  fakeAdminRole,
  fakeOwnerRole,
  fakeProfessionalRole
} from '@shared/constants/roles'
import {
  fakeUser1,
  fakeUser3,
  fakeUser2,
  fakeUser4
} from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeClinicsRepository: FakeClinicsRepository
let fakeHashProvider: FakeHashProvider

let updateUser: UpdateUserService

describe('UpdateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeHashProvider = new FakeHashProvider()

    updateUser = new UpdateUserService(fakeUsersRepository, fakeHashProvider)
  })

  it('should be able to admin/owner update a user', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const adminRole = await fakeRolesRepository.create(fakeAdminRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic1 = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    const user = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [adminRole],
      owner_id: owner.id,
      clinics: [clinic1]
    })

    const updatedUser = await updateUser.execute({
      name: 'Ronaldinho',
      email: 'wesleyzinho@gmail.com',
      birthdate: new Date(),
      address: {},
      phone: '84999998888',
      cpf: '09809809809',
      requester_id: owner.id,
      user_id: user.id
    })

    expect(updatedUser.name).toBe('Ronaldinho')
    expect(updatedUser.email).toBe('wesleyzinho@gmail.com')
  })

  it('should be able to admin/owner update the user password', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    const user = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [professionalRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    const updatedUser = await updateUser.execute({
      ...fakeUser2,
      password: 'new-pass',
      requester_id: owner.id,
      user_id: user.id
    })

    expect(updatedUser.password).toBe('new-pass')
  })

  it('should not be able to admin/owner update user that not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateUser.execute({
        ...fakeUser2,
        requester_id: owner.id,
        user_id: 'non-existing-user'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change user email if new email already exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [professionalRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    const user2 = await fakeUsersRepository.create({
      ...fakeUser3,
      roles: [ownerRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    await expect(
      updateUser.execute({
        ...fakeUser3,
        email: fakeUser2.email,
        requester_id: owner.id,
        user_id: user2.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change yourself', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateUser.execute({
        ...fakeUser2,
        requester_id: owner.id,
        user_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner update user that belongs to another owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const anotherOwner = await fakeUsersRepository.createProfile({
      ...fakeUser2,
      is_active: true,
      roles: [ownerRole]
    })

    const clinicBelongsToAnotherOwner = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: anotherOwner.id
    })

    const userBelongsToAnotherOwner = await fakeUsersRepository.create({
      ...fakeUser3,
      roles: [professionalRole],
      owner_id: anotherOwner.id,
      clinics: [clinicBelongsToAnotherOwner]
    })

    await expect(
      updateUser.execute({
        ...fakeUser4,
        requester_id: owner.id,
        user_id: userBelongsToAnotherOwner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change a user if user is owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const adminRole = await fakeRolesRepository.create(fakeAdminRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    const admin = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [adminRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    await expect(
      updateUser.execute({
        ...fakeUser1,
        requester_id: admin.id,
        user_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change a user with non-existing-owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const adminRole = await fakeRolesRepository.create(fakeAdminRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    const admin = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [adminRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    await expect(
      updateUser.execute({
        ...fakeUser2,
        requester_id: 'non-existing-owner',
        user_id: admin.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
