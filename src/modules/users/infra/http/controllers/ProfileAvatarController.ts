import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import UpdateProfileAvatarService from '@modules/users/services/UpdateProfileAvatarService'

export default class ProfileAvatarController {
  public async update(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id

    const updateUserAvatar = container.resolve(UpdateProfileAvatarService)

    const user = await updateUserAvatar.execute({
      user_id,
      avatarFilename: request.file.filename
    })

    return response.json(classToClass(user))
  }
}
