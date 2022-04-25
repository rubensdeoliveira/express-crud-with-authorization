import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import DeleteClinicService from './DeleteClinicService'
import { fakeAdminRole, fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'
import AppError from '@shared/errors/AppError'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'

let fakeClinicsRepository: FakeClinicsRepository
let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let deleteClinic: DeleteClinicService

describe('DeleteClinic', () => {
  beforeEach(() => {
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    deleteClinic = new DeleteClinicService(
      fakeClinicsRepository,
      fakeUsersRepository,
      fakeCacheProvider
    )
  })

  it('should be able to delete a clinic', async () => {
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

    await deleteClinic.execute({
      clinic_id: clinic.id,
      requester_id: owner.id
    })

    const findClinicDeleted = await fakeClinicsRepository.findById(clinic.id)

    expect(findClinicDeleted).toBeUndefined()
  })

  it('should not be able to delete a clinic that not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      deleteClinic.execute({
        clinic_id: 'inexistent-clinic',
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to delete a clinic that belongs to another owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const anotherOwner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinicBelongsToAnotherOwner = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: anotherOwner.id
    })

    await expect(
      deleteClinic.execute({
        clinic_id: clinicBelongsToAnotherOwner.id,
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to delete a clinic with employees', async () => {
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

    await fakeUsersRepository.create({
      ...fakeUser1,
      roles: [adminRole],
      clinics: [clinic],
      owner_id: owner.id
    })

    await expect(
      deleteClinic.execute({
        clinic_id: clinic.id,
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to delete a clinic with non-existing-owner', async () => {
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
      deleteClinic.execute({
        clinic_id: clinic.id,
        requester_id: 'non-existing-owner'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
