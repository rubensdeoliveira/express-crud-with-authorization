import { fakeOwnerRole, fakeProfessionalRole } from '@shared/constants/roles'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import AppError from '@shared/errors/AppError'

import FakeRolesRepository from '../repositories/fakes/FakeRolesRepository'

import UpdateRoleService from './UpdateRoleService'

let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let updateRole: UpdateRoleService

describe('UpdateRole', () => {
  beforeEach(() => {
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    updateRole = new UpdateRoleService(fakeRolesRepository, fakeCacheProvider)
  })

  it('should be able to update role Role', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const updatedRole = await updateRole.execute({
      ...fakeOwnerRole,
      name: 'admin',
      role_id: ownerRole.id
    })

    expect(updatedRole.name).toBe('admin')
  })

  it('should not be able to update Role from non-existing role', async () => {
    await expect(
      updateRole.execute({
        ...fakeProfessionalRole,
        role_id: 'non-existing-role'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
