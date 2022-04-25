import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import ShowUserService from './ShowUserService'
import {
  fakeAdminRole,
  fakeOwnerRole,
  fakeProfessionalRole
} from '@shared/constants/roles'
import { fakeUser1, fakeUser3, fakeUser2 } from '@shared/constants/users'
import { fakeClinic1 } from '@shared/constants/clinics'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeClinicsRepository: FakeClinicsRepository

let showUser: ShowUserService

describe('ShowUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()

    showUser = new ShowUserService(fakeUsersRepository)
  })

  it('should be able to admin/owner show a user', async () => {
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

    const user = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [professionalRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    const userShowed = await showUser.execute({
      user_id: user.id,
      requester_id: owner.id
    })

    expect(userShowed.name).toBe(fakeUser2.name)
    expect(userShowed.email).toBe(fakeUser2.email)
    expect(userShowed.address.street).toBe(fakeUser2.address.street)
  })

  it('should not be able to admin/owner show user that not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      showUser.execute({
        user_id: 'non-existing-user-id',
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner show yourself', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      showUser.execute({
        user_id: owner.id,
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to show user if user not belongs to owner', async () => {
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

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: anotherOwner.id
    })

    const user = await fakeUsersRepository.create({
      ...fakeUser3,
      roles: [ownerRole],
      owner_id: anotherOwner.id,
      clinics: [clinic]
    })

    await expect(
      showUser.execute({
        user_id: user.id,
        requester_id: owner.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin show a owner', async () => {
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

    const admin = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [adminRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    await expect(
      showUser.execute({
        user_id: owner.id,
        requester_id: admin.id
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
