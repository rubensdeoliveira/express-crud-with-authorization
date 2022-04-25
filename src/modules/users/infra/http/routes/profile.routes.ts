import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'

import ProfileController from '../controllers/ProfileController'
import ProfileAvatarController from '../controllers/ProfileAvatarController'
import ProfilePasswordController from '../controllers/ProfilePasswordController'

import { is } from '../middlewares/ensureAuthorized'
import multer from 'multer'
import uploadConfig from '@config/upload'

const profileRouter = Router()
const profileController = new ProfileController()
const profileAvatarController = new ProfileAvatarController()
const profilePasswordController = new ProfilePasswordController()

const upload = multer(uploadConfig)

profileRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(6).max(100).required(),
      email: Joi.string().email().required(),
      birthdate: Joi.date().required(),
      phone: Joi.string().min(10).max(11).required(),
      cpf: Joi.string().min(11).max(11).required(),
      password: Joi.string().min(6).max(50).required(),
      password_confirmation: Joi.string()
        .min(6)
        .max(50)
        .required()
        .valid(Joi.ref('password'))
    }
  }),
  profileController.create
)

profileRouter.use(is(['authenticated']))

profileRouter.get('/', profileController.show)

profileRouter.put(
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
          cep: Joi.string().allow(null).min(9).max(9),
          street: Joi.string().allow(null).max(50),
          neighborhood: Joi.string().allow(null).max(50),
          number: Joi.string().allow(null).max(50),
          city: Joi.string().allow(null).max(50),
          state: Joi.string().allow(null).min(2).max(2)
        })
    }
  }),
  profileController.update
)

profileRouter.patch(
  '/avatar',
  upload.single('avatar'),
  profileAvatarController.update
)

profileRouter.patch(
  '/update-password',
  celebrate({
    [Segments.BODY]: {
      old_password: Joi.string().required(),
      password: Joi.string().required().min(6).max(50),
      password_confirmation: Joi.string()
        .required()
        .min(6)
        .max(50)
        .valid(Joi.ref('password'))
    }
  }),
  profilePasswordController.update
)

export default profileRouter
