import {
  fakeAdminRole,
  fakeOwnerRole,
  fakeProfessionalRole
} from '@shared/constants/roles'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import FakeRolesRepository from '../repositories/fakes/FakeRolesRepository'

import ListRolesService from './ListRolesService'

let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let listRoles: ListRolesService

describe('ListRoles', () => {
  beforeEach(() => {
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    listRoles = new ListRolesService(fakeRolesRepository, fakeCacheProvider)
  })

  it('should be able to list roles', async () => {
    await fakeRolesRepository.create(fakeOwnerRole)
    const adminRole = await fakeRolesRepository.create(fakeAdminRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const rolesList = await listRoles.execute()

    expect(rolesList.results).toEqual([adminRole, professionalRole])
    expect(rolesList.total_results).toBe(2)
  })
})
