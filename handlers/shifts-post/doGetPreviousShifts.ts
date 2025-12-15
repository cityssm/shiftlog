import type { Request, Response } from 'express'

import getPreviousShifts from '../../database/shifts/getPreviousShifts.js'
import type { GetPreviousShiftsFilters } from '../../database/shifts/getPreviousShifts.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const shifts = await getPreviousShifts(
    request.body as GetPreviousShiftsFilters,
    request.session.user as User
  )

  response.json({
    shifts,
    success: true
  })
}
