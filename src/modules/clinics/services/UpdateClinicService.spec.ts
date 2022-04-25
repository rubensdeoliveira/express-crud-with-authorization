import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import UpdateClinicService from './UpdateClinicService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1, fakeUser2 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1, fakeClinic2 } from '@shared/constants/clinics'
import AppError from '@shared/errors/AppError'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'

let fakeClinicsRepository: FakeClinicsRepository
let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let updateClinic: UpdateClinicService

describe('updateClinic', () => {
  beforeEach(() => {
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    updateClinic = new UpdateClinicService(
      fakeClinicsRepository,
      fakeUsersRepository,
      fakeCacheProvider
    )
  })

  it('should be able to update a clinic', async () => {
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

    const updatedClinic = await updateClinic.execute({
      ...fakeClinic2,
      clinic_id: clinic.id,
      requester_id: owner.id
    })

    expect(updatedClinic).toHaveProperty('id')
    expect(updatedClinic.name).toBe(fakeClinic2.name)
    expect(updatedClinic.description).toBe(fakeClinic2.description)
    expect(updatedClinic.phone).toBe(fakeClinic2.phone)
    expect(updatedClinic.site).toBe(fakeClinic2.site)
  })

  it('should not be able to update a clinic if clinic does not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      updateClinic.execute({
        ...fakeClinic1,
        clinic_id: 'inexistent.clinic',
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to update a clinic that belongs to another owner', async () => {
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

    await expect(
      updateClinic.execute({
        ...fakeClinic1,
        clinic_id: clinicBelongsToAnotherOwner.id,
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to update a clinic with non-existing-owner', async () => {
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
      updateClinic.execute({
        ...fakeClinic1,
        clinic_id: clinic.id,
        requester_id: 'non-existing-owner'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
