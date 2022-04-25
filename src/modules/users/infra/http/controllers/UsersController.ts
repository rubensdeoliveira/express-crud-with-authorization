import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import ShowUserService from '@modules/users/services/ShowUserService'
import ListUsersService from '@modules/users/services/ListUsersService'
import CreateUserService from '@modules/users/services/CreateUserService'
import UpdateUserService from '@modules/users/services/UpdateUserService'
import DeleteUserService from '@modules/users/services/DeleteUserService'

export default class UsersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { user_id } = request.params

    const showUser = container.resolve(ShowUserService)

    const user = await showUser.execute({ user_id, requester_id })

    return response.json(classToClass(user))
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { page, search, clinic_id } = request.query

    const listUsers = container.resolve(ListUsersService)

    const users = await listUsers.execute({
      page: Number(page),
      search: search ? String(search) : '',
      clinic_id: String(clinic_id),
      requester_id
    })

    return response.json(classToClass(users))
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const {
      name,
      email,
      birthdate,
      phone,
      cpf,
      address,
      password,
      roles,
      clinic_id
    } = request.body

    const createUser = container.resolve(CreateUserService)

    const user = await createUser.execute({
      name,
      email,
      birthdate,
      phone,
      cpf,
      address,
      password,
      roles,
      clinic_id,
      requester_id
    })

    return response.json(classToClass(user))
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { user_id } = request.params

    const {
      name,
      email,
      birthdate,
      phone,
      cpf,
      address,
      password
    } = request.body

    const updateUser = container.resolve(UpdateUserService)

    const user = await updateUser.execute({
      name,
      email,
      birthdate,
      phone,
      cpf,
      address,
      password,
      user_id,
      requester_id
    })

    return response.json(classToClass(user))
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { user_id } = request.params

    const deleteUser = container.resolve(DeleteUserService)

    await deleteUser.execute({
      user_id,
      requester_id
    })

    return response.status(204).send()
  }
}
