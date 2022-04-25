import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'

import ListUsersService from './ListUsersService'
import {
  fakeAdminRole,
  fakeOwnerRole,
  fakeProfessionalRole
} from '@shared/constants/roles'
import {
  fakeUser1,
  fakeUser3,
  fakeUser2,
  fakeUser4
} from '@shared/constants/users'
import FakeClinicsRepository from '@modules/clinics/repositories/fakes/FakeClinicsRepository'
import { fakeClinic1, fakeClinic2 } from '@shared/constants/clinics'
import AppError from '@shared/errors/AppError'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeClinicsRepository: FakeClinicsRepository

let listUsers: ListUsersService

describe('ListUsers', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeClinicsRepository = new FakeClinicsRepository()

    listUsers = new ListUsersService(fakeUsersRepository, fakeClinicsRepository)
  })

  it('should be able to admin/owner list users', async () => {
    const newOnwerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [newOnwerRole]
    })

    const clinic = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner.id
    })

    const newUser1 = await fakeUsersRepository.create({
      ...fakeUser2,
      roles: [professionalRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    const newUser2 = await fakeUsersRepository.create({
      ...fakeUser3,
      roles: [professionalRole],
      owner_id: owner.id,
      clinics: [clinic]
    })

    const usersList = await listUsers.execute({
      page: 1,
      requester_id: owner.id,
      search: '',
      clinic_id: clinic.id
    })

    expect(usersList.page).toBe(1)
    expect(usersList.results).toEqual([newUser2, newUser1])
    expect(usersList.total_results).toBe(2)
    expect(usersList.total_pages).toBe(1)
  })

  it('should be able to paginate users list', async () => {
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

    for (let i = 1; i <= 21; i++) {
      await fakeUsersRepository.create({
        name: `user ${i}`,
        email: `email${i}@gmail.com`,
        birthdate: new Date('2020-02-20'),
        phone: '(84) 99999-9999',
        cpf: '111.111.111-11',
        address: {
          cep: '11111-111',
          street: `Rua ${i}`,
          neighborhood: `Bairro ${i}`,
          number: `${i}`,
          city: `Cidade ${i}`,
          state: 'RN'
        },
        roles: [adminRole],
        password: '12345678',
        owner_id: owner.id,
        clinics: [clinic],
        preferences: {}
      })
    }

    const usersFirstPage = await listUsers.execute({
      page: 1,
      requester_id: owner.id,
      search: '',
      clinic_id: clinic.id
    })

    const usersSecondPage = await listUsers.execute({
      page: 2,
      requester_id: owner.id,
      search: '',
      clinic_id: clinic.id
    })

    expect(usersFirstPage.page).toBe(1)
    expect(usersSecondPage.page).toBe(2)
    expect(usersFirstPage.results).toHaveLength(20)
    expect(usersSecondPage.results).toHaveLength(1)
    expect(usersFirstPage.total_results).toBe(21)
    expect(usersSecondPage.total_pages).toBe(2)
    expect(usersFirstPage.total_results).toBe(21)
    expect(usersSecondPage.total_pages).toBe(2)
  })

  it('should be able to list only users belongs to especific owner', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)
    const professionalRole = await fakeRolesRepository.create(
      fakeProfessionalRole
    )

    const owner1 = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const owner2 = await fakeUsersRepository.createProfile({
      ...fakeUser2,
      is_active: true,
      roles: [ownerRole]
    })

    const clinicBelongsOwner1 = await fakeClinicsRepository.create({
      ...fakeClinic1,
      owner_id: owner1.id
    })

    const clinicBelongsOwner2 = await fakeClinicsRepository.create({
      ...fakeClinic2,
      owner_id: owner2.id
    })

    const userBelongsToOwner1 = await fakeUsersRepository.create({
      ...fakeUser3,
      roles: [professionalRole],
      owner_id: owner1.id,
      clinics: [clinicBelongsOwner1]
    })

    const userBelongsToOwner2 = await fakeUsersRepository.create({
      ...fakeUser4,
      roles: [professionalRole],
      owner_id: owner2.id,
      clinics: [clinicBelongsOwner2]
    })

    const usersListBelongsToOwner1 = await listUsers.execute({
      page: 1,
      requester_id: owner1.id,
      search: '',
      clinic_id: clinicBelongsOwner1.id
    })

    const usersListBelongsToOwner2 = await listUsers.execute({
      page: 1,
      requester_id: owner2.id,
      search: '',
      clinic_id: clinicBelongsOwner2.id
    })

    expect(usersListBelongsToOwner1.results).toEqual([userBelongsToOwner1])
    expect(usersListBelongsToOwner2.results).toEqual([userBelongsToOwner2])
  })

  it('should be able to admin/owner list users with search', async () => {
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

    const user1 = await fakeUsersRepository.create({
      ...fakeUser2,
      owner_id: owner.id,
      clinics: [clinic],
      roles: [adminRole]
    })

    const user2 = await fakeUsersRepository.create({
      ...fakeUser3,
      owner_id: owner.id,
      clinics: [clinic],
      roles: [adminRole]
    })

    const search1 = await listUsers.execute({
      page: 1,
      clinic_id: clinic.id,
      requester_id: owner.id,
      search: 'ronald'
    })

    const search2 = await listUsers.execute({
      page: 1,
      clinic_id: clinic.id,
      requester_id: owner.id,
      search: 'hgranger'
    })

    const search3 = await listUsers.execute({
      page: 1,
      clinic_id: clinic.id,
      requester_id: owner.id,
      search: '8888'
    })

    const search4 = await listUsers.execute({
      page: 1,
      clinic_id: clinic.id,
      requester_id: owner.id,
      search: '3333'
    })

    expect(search1.results).toEqual([user1])
    expect(search2.results).toEqual([user2])
    expect(search3.results).toEqual([user1])
    expect(search4.results).toEqual([user2])
  })

  it('should not be able to list users if clinic passed not exists', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const owner = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await expect(
      listUsers.execute({
        page: 1,
        requester_id: owner.id,
        clinic_id: 'inexistent-clinic',
        search: ''
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to admin/owner list users that belongs to clinic that belongs to another owner', async () => {
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
      listUsers.execute({
        page: 1,
        requester_id: owner.id,
        clinic_id: clinicBelongsToAnotherOwner.id,
        search: ''
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
