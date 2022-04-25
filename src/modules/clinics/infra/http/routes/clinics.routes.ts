import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'

import ClinicsController from '../controllers/ClinicsController'

import { is } from '@modules/users/infra/http/middlewares/ensureAuthorized'

const clinicsRouter = Router()
const clinicsController = new ClinicsController()

clinicsRouter.use(is(['authenticated']))

clinicsRouter.get(
  '/',
  celebrate({
    [Segments.QUERY]: {
      search: Joi.any()
    }
  }),
  clinicsController.index
)

clinicsRouter.get(
  '/:clinic_id',
  celebrate({
    [Segments.PARAMS]: {
      clinic_id: Joi.string().uuid().required()
    }
  }),
  clinicsController.show
)

clinicsRouter.use(is(['owner', 'admin']))

clinicsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(3).max(100).required(),
      phone: Joi.string().min(10).max(11).required(),
      description: Joi.string(),
      site: Joi.string()
    }
  }),
  clinicsController.create
)

clinicsRouter.put(
  '/:clinic_id',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(3).max(100).required(),
      phone: Joi.string().min(10).max(11).required(),
      description: Joi.string(),
      site: Joi.string()
    },
    [Segments.PARAMS]: {
      clinic_id: Joi.string().uuid().required()
    }
  }),
  clinicsController.update
)

clinicsRouter.delete(
  '/:clinic_id',
  celebrate({
    [Segments.PARAMS]: {
      clinic_id: Joi.string().uuid().required()
    }
  }),
  clinicsController.delete
)

export default clinicsRouter
