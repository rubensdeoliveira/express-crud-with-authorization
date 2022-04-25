import { fakeOwnerRole } from '@shared/constants/roles'
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import AppError from '@shared/errors/AppError'
import FakeRolesRepository from '../repositories/fakes/FakeRolesRepository'

import DeleteRoleService from './DeleteRoleService'

let fakeRolesRepository: FakeRolesRepository
let fakeCacheProvider: FakeCacheProvider

let deleteRole: DeleteRoleService

describe('DeleteRole', () => {
  beforeEach(() => {
    fakeRolesRepository = new FakeRolesRepository()
    fakeCacheProvider = new FakeCacheProvider()

    deleteRole = new DeleteRoleService(fakeRolesRepository, fakeCacheProvider)
  })

  it('should be able to delete a role', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    await deleteRole.execute({
      role_id: ownerRole.id
    })

    const findRoleDeleted = await fakeRolesRepository.findById(ownerRole.id)

    expect(findRoleDeleted).toBeUndefined()
  })

  it('should not be able to delete a role if not exists', async () => {
    await expect(
      deleteRole.execute({
        role_id: 'not-existing-role'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
