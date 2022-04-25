import AppError from '@shared/errors/AppError'
import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import authConfig from '@config/auth'
import UsersRepository from '../../typeorm/repositories/UsersRepository'

interface IPayload {
  sub: string
}

async function decoder(request: Request): Promise<string | undefined> {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    throw new AppError('JWT não foi enviado', 401)
  }

  const [, token] = authHeader.split(' ')

  try {
    const { sub: user_id } = verify(
      token,
      authConfig.jwt.secret_token
    ) as IPayload

    request.user = {
      id: user_id
    }

    return user_id
  } catch {
    throw new AppError('JWT inválido', 401)
  }
}

async function isActived(user_id: string): Promise<boolean> {
  let checkUserIsActived = false

  const usersRepository = new UsersRepository()

  const user = await usersRepository.findById(user_id)
  const ownerUser = await usersRepository.findOwnerByRequesterId(user_id)

  if (!user || !ownerUser) return checkUserIsActived

  checkUserIsActived = ownerUser.is_active && user.is_active

  return checkUserIsActived
}

function is(role: string[]) {
  const roleAuthorized = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const usersRepository = new UsersRepository()

    const user_id = await decoder(request)
    if (!user_id) {
      throw new AppError('JWT inválido', 401)
    }

    const userIsActived = await isActived(user_id)
    if (!userIsActived) {
      throw new AppError(
        'Conta temporariamente bloqueada, entre em contato com o suporte para mais detalhes',
        401
      )
    }

    const userRoles = await usersRepository.findUserRolesByUserId(user_id)
    const existRoles = userRoles.some(
      r => role.includes(r) || role.includes('authenticated')
    )
    if (!existRoles) {
      throw new AppError(
        'Usuário não possui permissões para acessar esta rota',
        401
      )
    }

    return next()
  }

  return roleAuthorized
}

export { is, isActived }
