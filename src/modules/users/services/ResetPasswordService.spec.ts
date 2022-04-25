import AppError from '@shared/errors/AppError'

import authConfig from '@config/auth'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'
import FakeUsersTokensRepository from '../repositories/fakes/FakeUsersTokensRepository'
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider'

import ResetPasswordService from './ResetPasswordService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'
import { addDays } from 'date-fns'
import { sign } from 'jsonwebtoken'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeUsersTokensRepository: FakeUsersTokensRepository
let fakeHashProvider: FakeHashProvider
let resetPassword: ResetPasswordService

describe('ResetPasswordService', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeUsersTokensRepository = new FakeUsersTokensRepository()
    fakeHashProvider = new FakeHashProvider()

    resetPassword = new ResetPasswordService(
      fakeUsersRepository,
      fakeUsersTokensRepository,
      fakeHashProvider
    )
  })

  it('should be able to reset password', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const userToken = await fakeUsersTokensRepository.create({
      expires_date: addDays(Date.now(), 1),
      refresh_token: 'refresh-token',
      user_id: user.id,
      created_at: new Date(Date.now())
    })

    const generateHash = jest.spyOn(fakeHashProvider, 'generateHash')

    await resetPassword.execute({
      password: 'new-pass',
      token: userToken.refresh_token
    })

    const updatedUser = await fakeUsersRepository.findById(user.id)

    expect(generateHash).toHaveBeenCalledWith('new-pass')
    expect(updatedUser?.password).toBe('new-pass')
  })

  it('should not be able to reset password with non-existing token', async () => {
    await expect(
      resetPassword.execute({
        token: 'non-existing-token',
        password: '123456'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to reset password with non-existing user', async () => {
    const userToken = await fakeUsersTokensRepository.create({
      expires_date: addDays(Date.now(), 1),
      refresh_token: 'refresh-token',
      user_id: 'non-existing-user',
      created_at: new Date(Date.now())
    })

    await expect(
      resetPassword.execute({
        token: userToken.refresh_token,
        password: '123456'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should be not able to reset password if passed more than 2 hours', async () => {
    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    const { secret_refresh_token, expires_in_refresh_token } = authConfig.jwt

    const user = await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    const refresh_token = sign({}, secret_refresh_token, {
      subject: user.id,
      expiresIn: expires_in_refresh_token
    })

    const userToken = await fakeUsersTokensRepository.create({
      expires_date: addDays(Date.now(), 1),
      refresh_token,
      user_id: user.id,
      created_at: new Date(Date.now())
    })

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      const customDate = new Date()

      return customDate.setHours(customDate.getHours() + 3)
    })

    await expect(
      resetPassword.execute({
        password: 'new-pass',
        token: userToken.refresh_token
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
