import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'

import ForgotPasswordController from '../controllers/ForgotPasswordController'
import ResetPasswordController from '../controllers/ResetPasswordController'

const passwordRouter = Router()
const forgotPasswordController = new ForgotPasswordController()
const resetPasswordController = new ResetPasswordController()

passwordRouter.post(
  '/forgot',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required()
    }
  }),
  forgotPasswordController.create
)

passwordRouter.post(
  '/reset',
  celebrate({
    [Segments.BODY]: {
      password: Joi.string().min(6).max(50).required()
    },
    [Segments.QUERY]: {
      token: Joi.string().uuid().required()
    }
  }),
  resetPasswordController.create
)

export default passwordRouter
