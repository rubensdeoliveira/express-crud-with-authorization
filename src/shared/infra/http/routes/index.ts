import { Router } from 'express'

import usersRouter from '@modules/users/infra/http/routes/users.routes'
import userPreferencesRoutes from '@modules/users/infra/http/routes/user-preferences.routes'
import sessionsRouter from '@modules/users/infra/http/routes/sessions.routes'
import passwordRouter from '@modules/users/infra/http/routes/password.routes'
import profileRouter from '@modules/users/infra/http/routes/profile.routes'
import rolesRouter from '@modules/roles/infra/http/routes/roles.routes'
import clinicsRouter from '@modules/clinics/infra/http/routes/clinics.routes'

const routes = Router()

routes.use('/users', usersRouter)
routes.use('/user-preferences', userPreferencesRoutes)
routes.use('/sessions', sessionsRouter)
routes.use('/password', passwordRouter)
routes.use('/profile', profileRouter)
routes.use('/roles', rolesRouter)
routes.use('/clinics', clinicsRouter)

export default routes
