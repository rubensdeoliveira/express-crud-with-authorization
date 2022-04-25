import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'

import SessionsController from '../controllers/SessionsController'
import ValidateTokenController from '../controllers/ValidateTokenController'
import { is } from '../middlewares/ensureAuthorized'
import RefreshTokenController from '../controllers/RefreshTokenController'

const sessionsRouter = Router()
const sessionsController = new SessionsController()
const validateTokenController = new ValidateTokenController()
const refreshTokenController = new RefreshTokenController()

sessionsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  }),
  sessionsController.create
)
sessionsRouter.post('/refresh-token', refreshTokenController.handle)

sessionsRouter.use(is(['authenticated']))

sessionsRouter.get('/validate-token', validateTokenController.show)

export default sessionsRouter
