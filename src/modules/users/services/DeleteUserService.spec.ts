import AppError from '@shared/errors/AppError'
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import DeleteUserService from './DeleteUserService'
import {
  fakeOwnerRole,
  fakeProfessionalRole,
  fakeAdminRole
} from '@shared/constants/roles'
import { fakeUser1, fakeUser3, fakeUser2 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeClinicsRepository: FakeClinicsRepository

let deleteUser: DeleteUserService

describe('DeleteUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()

    deleteUser = new DeleteUserService(fakeUsersRepository)
  })

  it('should be able to admin/owner block a user', async () => {
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

    const user1 = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [professionalRole],
      owner_id: owner.id,
      clinics: [clinic],
      is_active: true
    })

    const user2 = await fakeUsersRepository.create({
      ...fakeUser3,
      roles: [professionalRole],
      owner_id: owner.id,
      clinics: [clinic],
      is_active: false
    })

    await deleteUser.execute({
      requester_id: owner.id,
      user_id: user1.id
    })

    await deleteUser.execute({
      requester_id: owner.id,
      user_id: user2.id
    })

    expect(user1.is_active).toBeFalsy()
    expect(user2.is_active).toBeTruthy()
  })

  it('should not be able to admin/owner block a user if not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      deleteUser.execute({
        requester_id: owner.id,
        user_id: 'non-existing-user'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner block yourself', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      deleteUser.execute({
        requester_id: owner.id,
        user_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner block a user if user belongs to another owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

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
      roles: [ownerRole],
      owner_id: anotherOwner.id,
      clinics: [clinicBelongsToAnotherOwner]
    })

    await expect(
      deleteUser.execute({
        user_id: userBelongsToAnotherOwner.id,
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner block a user if user is owner', async () => {
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
      deleteUser.execute({
        user_id: owner.id,
        requester_id: admin.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
