import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import ShowProfileService from '@modules/users/services/ShowProfileService'
import CreateProfileService from '@modules/users/services/CreateProfileService'
import UpdateProfileService from '@modules/users/services/UpdateProfileService'

export default class ProfileController {
  public async show(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id

    const showProfile = container.resolve(ShowProfileService)

    const user = await showProfile.execute({ user_id })

    return response.json(classToClass(user))
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email, birthdate, phone, cpf, password } = request.body

    const createProfile = container.resolve(CreateProfileService)

    const user = await createProfile.execute({
      name,
      email,
      birthdate,
      phone,
      cpf,
      password
    })

    return response.json(classToClass(user))
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id

    const { name, email, birthdate, phone, cpf, address } = request.body

    const updateProfile = container.resolve(UpdateProfileService)

    const user = await updateProfile.execute({
      name,
      email,
      birthdate,
      phone,
      cpf,
      address,
      user_id
    })

    return response.json(classToClass(user))
  }
}
