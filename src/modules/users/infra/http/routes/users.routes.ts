import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'

import UsersController from '../controllers/UsersController'

import { is } from '@modules/users/infra/http/middlewares/ensureAuthorized'

const usersRouter = Router()
const usersController = new UsersController()

usersRouter.use(is(['owner', 'admin', 'secretary']))

usersRouter.get(
  '/',
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().required(),
      search: Joi.any(),
      clinic_id: Joi.string().uuid().required()
    }
  }),
  usersController.index
)

usersRouter.get(
  '/:user_id',
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.string().uuid().required()
    }
  }),
  usersController.show
)

usersRouter.use(is(['owner', 'admin']))

usersRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(6).max(100).required(),
      email: Joi.string().email().required(),
      birthdate: Joi.date().required(),
      phone: Joi.string().min(10).max(11).required(),
      cpf: Joi.string().min(11).max(11).required(),
      address: Joi.object()
        .required()
        .keys({
          cep: Joi.string().min(8).max(9),
          street: Joi.string().max(50),
          neighborhood: Joi.string().max(50),
          number: Joi.string().max(50),
          city: Joi.string().max(50),
          state: Joi.string().min(2).max(2)
        }),
      roles: Joi.array().min(1).items(Joi.string()).required(),
      clinic_id: Joi.string().uuid().required(),
      password: Joi.string().min(6).max(50).required(),
      password_confirmation: Joi.string()
        .min(6)
        .max(50)
        .required()
        .valid(Joi.ref('password'))
    }
  }),
  usersController.create
)

usersRouter.put(
  '/:user_id',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(6).max(100).required(),
      email: Joi.string().email().required(),
      birthdate: Joi.date().required(),
      phone: Joi.string().min(10).max(11).required(),
      cpf: Joi.string().min(11).max(11).required(),
      address: Joi.object()
        .required()
        .keys({
          cep: Joi.string().min(8).max(9),
          street: Joi.string().max(50),
          neighborhood: Joi.string().max(50),
          number: Joi.string().max(50),
          city: Joi.string().max(50),
          state: Joi.string().min(2).max(2)
        }),
      password: Joi.string().min(6).max(50),
      password_confirmation: Joi.string()
        .min(6)
        .max(50)
        .valid(Joi.ref('password'))
    },
    [Segments.PARAMS]: {
      user_id: Joi.string().uuid().required()
    }
  }),
  usersController.update
)

usersRouter.delete(
  '/:user_id',
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.string().uuid().required()
    }
  }),
  usersController.delete
)

usersRouter.patch(
  '/:user_id',
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.string().uuid().required()
    },
    [Segments.BODY]: {
      roles: Joi.array().min(1).items(Joi.string()).required()
    }
  }),
  usersController.delete
)

export default usersRouter
