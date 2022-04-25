import AppError from '@shared/errors/AppError'

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import FakeRolesRepository from '@modules/roles/repositories/fakes/FakeRolesRepository'
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider'
import FakeUsersTokensRepository from '../repositories/fakes/FakeUsersTokensRepository'
import SendForgotPasswordEmailService from './SendForgotPasswordEmailService'
import { fakeOwnerRole } from '@shared/constants/roles'
import { fakeUser1 } from '@shared/constants/users'

let fakeUsersRepository: FakeUsersRepository
let fakeRolesRepository: FakeRolesRepository
let fakeMailProvider: FakeMailProvider
let fakeUsersTokensRepository: FakeUsersTokensRepository
let sendForgotPasswordEmail: SendForgotPasswordEmailService

describe('SendForgotPasswordEmail', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeRolesRepository = new FakeRolesRepository()
    fakeMailProvider = new FakeMailProvider()
    fakeUsersTokensRepository = new FakeUsersTokensRepository()

    sendForgotPasswordEmail = new SendForgotPasswordEmailService(
      fakeUsersRepository,
      fakeMailProvider,
      fakeUsersTokensRepository
    )
  })

  it('should be able to recover password using email', async () => {
    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail')

    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await sendForgotPasswordEmail.execute({
      email: fakeUser1.email
    })

    expect(sendMail).toHaveBeenCalled()
  })

  it('should not be able to recover a password from non-existing user', async () => {
    await expect(
      sendForgotPasswordEmail.execute({
        email: 'non-existing-user@gmail.com'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should generate a forgot password token', async () => {
    const generateToken = jest.spyOn(fakeUsersTokensRepository, 'create')

    const ownerRole = await fakeRolesRepository.create(fakeOwnerRole)

    await fakeUsersRepository.createProfile({
      ...fakeUser1,
      is_active: true,
      roles: [ownerRole]
    })

    await sendForgotPasswordEmail.execute({
      email: fakeUser1.email
    })

    await expect(generateToken).toBeCalled()
  })
})
