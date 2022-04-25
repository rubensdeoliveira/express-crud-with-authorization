import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import UpdateUserRolesService from './UpdateUserRolesService'
import {
  fakeAdminRole,
  fakeOwnerRole,
  fakeProfessionalRole
} from '@shared/constants/roles'
import { fakeUser1, fakeUser3, fakeUser2 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeClinicsRepository: FakeClinicsRepository

let updateUserRoles: UpdateUserRolesService

describe('UpdateUserRoles', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()

    updateUserRoles = new UpdateUserRolesService(
      fakeUsersRepository,
      fakeRolesRepository
    )
  })

  it('should be able to admin/owner update a user role', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const adminRole = await fakeRolesRepository.create(fakeAdminRole)
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
      roles: [adminRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    await updateUserRoles.execute({
      roles: [professionalRole.name],
      requester_id: owner.id,
      user_id: user.id
    })

    expect(user.roles).toEqual([professionalRole])
  })

  it('should not be able to admin/owner update user roles that not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateUserRoles.execute({
        roles: [professionalRole.name],
        requester_id: owner.id,
        user_id: 'non-existing-user'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change yourself', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateUserRoles.execute({
        roles: [professionalRole.name],
        requester_id: owner.id,
        user_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner update user roles from user that belongs to another owner', async () => {
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
      updateUserRoles.execute({
        roles: [professionalRole.name],
        requester_id: owner.id,
        user_id: userBelongsToAnotherOwner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change a user roles from user if user is owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const adminRole = await fakeRolesRepository.create(fakeAdminRole)
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

    const admin = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [adminRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    await expect(
      updateUserRoles.execute({
        roles: [professionalRole.name],
        requester_id: admin.id,
        user_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change a user roles if roles are invalid', async () => {
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
      updateUserRoles.execute({
        roles: ['invalid-role'],
        requester_id: owner.id,
        user_id: admin.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner change a user roles if roles are invalid', async () => {
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
      updateUserRoles.execute({
        roles: [ownerRole.name],
        requester_id: owner.id,
        user_id: admin.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
