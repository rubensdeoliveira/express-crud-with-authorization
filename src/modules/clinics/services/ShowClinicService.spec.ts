import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import ShowClinicService from './ShowClinicService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1, fakeUser2 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'
import AppError from '@shared/errors/AppError'

let fakeClinicsRepository: FakeClinicsRepository
let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository

let showClinic: ShowClinicService

describe('ShowClinic', () => {
  beforeEach(() => {
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()

    showClinic = new ShowClinicService(
      fakeClinicsRepository,
      fakeUsersRepository
    )
  })

  it('should be able to show a clinic', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const newClinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    const clinic = await showClinic.execute({
      clinic_id: newClinic.id,
      requester_id: owner.id
    })

    expect(clinic).toHaveProperty('id')
    expect(clinic.name).toBe(fakeClinic1.name)
    expect(clinic.description).toBe(fakeClinic1.description)
    expect(clinic.phone).toBe(fakeClinic1.phone)
    expect(clinic.site).toBe(fakeClinic1.site)
  })

  it('should not be able to show a clinic if clinic does not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      showClinic.execute({
        clinic_id: 'inexistent-clinic',
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to show a clinic if clinic belongs to another owner', async () => {
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
      showClinic.execute({
        clinic_id: clinicBelongsToAnotherOwner.id,
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
