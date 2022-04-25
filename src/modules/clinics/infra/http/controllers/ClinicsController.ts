import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { classToClass } from 'class-transformer'

import ShowClinicService from '@modules/clinics/services/ShowClinicService'
import ListClinicsService from '@modules/clinics/services/ListClinicsService'
import CreateClinicService from '@modules/clinics/services/CreateClinicService'
import UpdateClinicService from '@modules/clinics/services/UpdateClinicService'
import DeleteClinicService from '@modules/clinics/services/DeleteClinicService'

export default class ClinicsController {
  public async show(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { clinic_id } = request.params

    const showClinic = container.resolve(ShowClinicService)

    const clinic = await showClinic.execute({ clinic_id, requester_id })

    return response.json(classToClass(clinic))
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { search } = request.query

    const listClinics = container.resolve(ListClinicsService)

    const clinics = await listClinics.execute({
      search: search ? String(search) : '',
      requester_id
    })

    return response.json(classToClass(clinics))
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { name, phone, description, site } = request.body

    const createClinic = container.resolve(CreateClinicService)

    const clinic = await createClinic.execute({
      name,
      phone,
      description,
      site,
      requester_id
    })

    return response.json(classToClass(clinic))
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { clinic_id } = request.params
    const { name, phone, description, site } = request.body

    const updateClinic = container.resolve(UpdateClinicService)

    const clinic = await updateClinic.execute({
      name,
      phone,
      description,
      site,
      clinic_id,
      requester_id
    })

    return response.json(classToClass(clinic))
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const requester_id = request.user.id

    const { clinic_id } = request.params

    const deleteClinic = container.resolve(DeleteClinicService)

    await deleteClinic.execute({
      clinic_id,
      requester_id
    })

    return response.status(204).send()
  }
}
