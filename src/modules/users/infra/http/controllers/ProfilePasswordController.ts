import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import UpdateProfilePasswordService from '@modules/users/services/UpdateProfilePasswordService'

export default class ProfilePasswordController {
  public async update(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id

    const { old_password, password } = request.body

    const updateProfilePassword = container.resolve(
      UpdateProfilePasswordService
    )

    const user = await updateProfilePassword.execute({
      old_password,
      password,
      user_id
    })

    return response.json(classToClass(user))
  }
}
