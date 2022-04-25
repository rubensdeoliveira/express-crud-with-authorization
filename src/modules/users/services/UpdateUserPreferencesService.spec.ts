import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import UpdateUserPreferencesService from './UpdateUserPreferencesService'
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

let updateUserPreferences: UpdateUserPreferencesService

describe('UpdateUserPreferences', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()

    updateUserPreferences = new UpdateUserPreferencesService(
      fakeUsersRepository
    )
  })

  it('should be able to update a user preference', async () => {
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

    await updateUserPreferences.execute({
      appointmentMinTime: 11,
      appointmentMaxTime: 13,
      requester_id: owner.id,
      user_id: user.id
    })

    expect(user.preferences.appointmentMinTime).toBe(11)
    expect(user.preferences.appointmentMaxTime).toBe(13)
  })

  it('should not be able to update user preference from user that not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateUserPreferences.execute({
        appointmentMinTime: 11,
        appointmentMaxTime: 13,
        requester_id: owner.id,
        user_id: 'non-existing-user'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to update user preferences from user that belongs to another owner', async () => {
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
      updateUserPreferences.execute({
        appointmentMinTime: 11,
        appointmentMaxTime: 13,
        requester_id: owner.id,
        user_id: userBelongsToAnotherOwner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to change a user if user is owner', async () => {
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
      updateUserPreferences.execute({
        appointmentMinTime: 11,
        appointmentMaxTime: 13,
        requester_id: admin.id,
        user_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to change a user if user is not a professional', async () => {
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
      updateUserPreferences.execute({
        appointmentMinTime: 11,
        appointmentMaxTime: 13,
        requester_id: owner.id,
        user_id: admin.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to choose appointment times in same hour', async () => {
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

    await expect(
      updateUserPreferences.execute({
        appointmentMinTime: 13,
        appointmentMaxTime: 13,
        requester_id: owner.id,
        user_id: user.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to choose appointment minimum time bigger than maximum time', async () => {
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

    await expect(
      updateUserPreferences.execute({
        appointmentMinTime: 14,
        appointmentMaxTime: 13,
        requester_id: owner.id,
        user_id: user.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
