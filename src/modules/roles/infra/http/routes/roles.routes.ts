import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'

import RolesController from '../controllers/RolesController'
import { is } from '@modules/users/infra/http/middlewares/ensureAuthorized'

const rolesRouter = Router()

const rolesController = new RolesController()

rolesRouter.use(is(['authenticated']))

rolesRouter.get('/', rolesController.index)

rolesRouter.use(is(['system']))

rolesRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      description: Joi.string().required()
    }
  }),
  rolesController.create
)
rolesRouter.put(
  '/:role_id',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      description: Joi.string().required()
    },
    [Segments.PARAMS]: {
      role_id: Joi.string().uuid().required()
    }
  }),
  rolesController.update
)
rolesRouter.delete(
  '/:role_id',
  celebrate({
    [Segments.PARAMS]: {
      role_id: Joi.string().uuid().required()
    }
  }),
  rolesController.delete
)

export default rolesRouter
