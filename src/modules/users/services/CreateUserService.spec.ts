import AppError from '@shared/errors/AppError'

import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider'
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import CreateUserService from './CreateUserService'
import { fakeOwnerRole, fakeProfessionalRole } from '@shared/constants/roles'
import { fakeUser1, fakeUser3, fakeUser2 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeClinicsRepository: FakeClinicsRepository

let fakeHashProvider: FakeHashProvider

let createUser: CreateUserService

describe('CreateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeHashProvider = new FakeHashProvider()

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakeRolesRepository,
      fakeClinicsRepository,
      fakeHashProvider
    )
  })

  it('should be able to create a new user', async () => {
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

    const user = await createUser.execute({
      ...fakeUser2,
      roles: [professionalRole.name],
      requester_id: owner.id,
      clinic_id: clinic.id
    })

    expect(user).toHaveProperty('id')
    expect(user.name).toBe(fakeUser2.name)
    expect(user.address.street).toBe(fakeUser2.address.street)
    expect(user.clinics).toEqual([clinic])
  })

  it('should not be able to create a new user with same email', async () => {
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

    await createUser.execute({
      ...fakeUser2,
      roles: [professionalRole.name],
      requester_id: owner.id,
      clinic_id: clinic.id
    })

    await expect(
      createUser.execute({
        ...fakeUser3,
        roles: [professionalRole.name],
        requester_id: owner.id,
        clinic_id: clinic.id,
        email: fakeUser2.email
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to create a new user with incorrect roles', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    await expect(
      createUser.execute({
        ...fakeUser2,
        roles: ['incorrect-role'],
        requester_id: owner.id,
        clinic_id: clinic.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to create a new user as a owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    await expect(
      createUser.execute({
        ...fakeUser2,
        roles: [ownerRole.name],
        requester_id: owner.id,
        clinic_id: clinic.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to create a new user with incorrect clinics', async () => {
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
      createUser.execute({
        ...fakeUser2,
        roles: [professionalRole.name],
        requester_id: owner.id,
        clinic_id: 'incorrect_clinic'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner create a new user with clinics that belongs to another owner', async () => {
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

    await expect(
      createUser.execute({
        ...fakeUser3,
        roles: [professionalRole.name],
        requester_id: owner.id,
        clinic_id: clinicBelongsToAnotherOwner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner create a new user with non-existing-owner', async () => {
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

    await expect(
      createUser.execute({
        ...fakeUser2,
        roles: [professionalRole.name],
        requester_id: 'non-existing-owner',
        clinic_id: clinic.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
