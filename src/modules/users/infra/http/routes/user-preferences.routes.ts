import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'

import { is } from '@modules/users/infra/http/middlewares/ensureAuthorized'
import UserPreferencesController from '../controllers/UserPreferencesController'

const userPreferencesRouter = Router()
const userPreferencesController = new UserPreferencesController()

userPreferencesRouter.use(is(['owner', 'admin', 'professional']))

userPreferencesRouter.put(
  '/:user_id',
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.string().uuid().required()
    },
    [Segments.BODY]: {
      appointmentMinTime: Joi.number().integer().min(0).max(24).required(),
      appointmentMaxTime: Joi.number().integer().min(0).max(24).required()
    }
  }),
  userPreferencesController.update
)

export default userPreferencesRouter
