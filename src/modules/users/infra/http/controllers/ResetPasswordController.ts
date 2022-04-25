import { Request, Response } from 'express'
import { container } from 'tsyringe'

import ResetPasswordService from '@modules/users/services/ResetPasswordService'

export default class ResetPasswordController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { token } = request.query
    const { password } = request.body

    const resetPassword = container.resolve(ResetPasswordService)

    await resetPassword.execute({
      token: String(token),
      password
    })

    return response.status(204).send()
  }
}
