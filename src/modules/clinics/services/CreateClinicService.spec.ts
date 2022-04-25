import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import CreateClinicService from './CreateClinicService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1 } from '@shared/constants/clinics'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import AppError from '@shared/errors/AppError'

let fakeClinicsRepository: FakeClinicsRepository
let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let createClinic: CreateClinicService

describe('CreateClinic', () => {
  beforeEach(() => {
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    createClinic = new CreateClinicService(
      fakeClinicsRepository,
      fakeUsersRepository,
      fakeCacheProvider
    )
  })

  it('should be able to create a new clinic', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const clinic = await createClinic.execute({
      ...fakeClinic1,
      requester_id: owner.id
    })

    expect(clinic).toHaveProperty('id')
    expect(clinic.name).toBe(fakeClinic1.name)
    expect(clinic.description).toBe(fakeClinic1.description)
    expect(clinic.phone).toBe(fakeClinic1.phone)
    expect(clinic.site).toBe(fakeClinic1.site)
  })

  it('should not be able to create a clinic with non-existing-owner', async () => {
    await expect(
      createClinic.execute({
        ...fakeClinic1,
        requester_id: 'non-existing-owner'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
