import { fakeOwnerRole, fakeProfessionalRole } from '@shared/constants/roles'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import AppError from '@shared/errors/AppError'
import FakeRolesRepository from '../repositories/fakes/FakeRolesRepository'

import CreateRoleService from './CreateRoleService'

let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let createRole: CreateRoleService

describe('CreateRole', () => {
  beforeEach(() => {
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    createRole = new CreateRoleService(fakeRolesRepository, fakeCacheProvider)
  })

  it('should be able to create a new role', async () => {
    const role = await createRole.execute(fakeOwnerRole)

    expect(role).toHaveProperty('id')
  })

  it('should not be able to create a new role if role name already exists', async () => {
    await createRole.execute(fakeOwnerRole)

    await expect(
      createRole.execute({ ...fakeProfessionalRole, name: fakeOwnerRole.name })
    ).rejects.toBeInstanceOf(AppError)
  })
})
