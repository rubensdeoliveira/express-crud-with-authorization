import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import ListClinicsService from './ListClinicsService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1, fakeClinic2 } from '@shared/constants/clinics'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import AppError from '@shared/errors/AppError'

let fakeClinicsRepository: FakeClinicsRepository
let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let listClinics: ListClinicsService

describe('ListClinics', () => {
  beforeEach(() => {
    fakeClinicsRepository = new FakeClinicsRepository()
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    listClinics = new ListClinicsService(
      fakeClinicsRepository,
      fakeUsersRepository,
      fakeCacheProvider
    )
  })

  it('should be able to admin/owner list clinics', async () => {
    const newOnwerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [newOnwerRole]
    })

    const clinic1 = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    const clinic2 = await fakeClinicsRepository.create({
      ...fakeClinic2,
      owner_id: owner.id
    })

    const usersList = await listClinics.execute({
      requester_id: owner.id
    })

    expect(usersList.results).toEqual([clinic1, clinic2])
    expect(usersList.total_results).toBe(2)
  })

  it('should not be able to list clinics with non-existing-owner', async () => {
    await expect(
      listClinics.execute({
        requester_id: 'non-existing-owner'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
