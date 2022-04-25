import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import UpdateUserRolesService from '@modules/users/services/UpdateUserRolesService'

export default class UserRolesController {
  public async update(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { user_id } = request.params
    const { roles } = request.body

    const updateUserRoles = container.resolve(UpdateUserRolesService)

    const user = await updateUserRoles.execute({
      roles,
      user_id,
      requester_id
    })

    return response.json(classToClass(user))
  }
}
