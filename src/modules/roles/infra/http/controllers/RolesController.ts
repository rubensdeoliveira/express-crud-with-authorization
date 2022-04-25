import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import ListRolesService from '@modules/roles/services/ListRolesService'
import CreateRoleService from '@modules/roles/services/CreateRoleService'
import UpdateRoleService from '@modules/roles/services/UpdateRoleService'
import DeleteRoleService from '@modules/roles/services/DeleteRoleService'

export default class RolesController {
  public async index(request: Request, response: Response): Promise<Response> {
    const listRoles = container.resolve(ListRolesService)

    const roles = await listRoles.execute()

    return response.json(classToClass(roles))
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { name, description } = request.body

    const createRole = container.resolve(CreateRoleService)

    const role = await createRole.execute({
      name,
      description
    })

    return response.json(classToClass(role))
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { role_id } = request.params
    const { name, description } = request.body

    const updateRole = container.resolve(UpdateRoleService)

    const role = await updateRole.execute({
      role_id,
      name,
      description
    })

    return response.json(classToClass(role))
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { role_id } = request.params

    const deleteRole = container.resolve(DeleteRoleService)

    await deleteRole.execute({
      role_id
    })

    return response.status(204).send()
  }
}
