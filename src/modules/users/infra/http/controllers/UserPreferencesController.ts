import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import UpdateUserPreferencesService from '@modules/users/services/UpdateUserPreferencesService'

export default class UserPreferencesController {
  public async update(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { user_id } = request.params
    const { appointmentMinTime, appointmentMaxTime } = request.body

    const updateUserPreferences = container.resolve(
      UpdateUserPreferencesService
    )

    const user = await updateUserPreferences.execute({
      appointmentMinTime,
      appointmentMaxTime,
      user_id,
      requester_id
    })

    return response.json(classToClass(user))
  }
}
