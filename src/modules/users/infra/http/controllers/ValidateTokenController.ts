import { Request, Response } from 'express'

export default class ValidateTokenController {
  public async show(request: Request, response: Response): Promise<Response> {
    return response.status(200).send()
  }
}
