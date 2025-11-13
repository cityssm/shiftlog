import { type NextFunction, type Request, type Response, Router } from 'express'

import newHandler from '../handlers/shifts-get/new.js'
import searchHandler from '../handlers/shifts-get/search.js'

function updateHandler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response,
  next: NextFunction
): void {
  if (request.session.user?.userProperties.shifts.canUpdate ?? false) {
    next()
  } else {
    response.status(403).send('Forbidden')
  }
}

export const router = Router()

router.get('/', searchHandler)

router.get('/new', updateHandler, newHandler)

export default router
