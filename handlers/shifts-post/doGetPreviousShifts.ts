import type { Request, Response } from 'express'

import getPreviousShifts from '../../database/shifts/getPreviousShifts.js'
import type { GetPreviousShiftsFilters } from '../../database/shifts/getPreviousShifts.js'
import type { Shift } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetPreviousShiftsResponse = {
  success: true
  shifts: Shift[]
}

export default async function handler(
  request: Request,
  response: Response<DoGetPreviousShiftsResponse>
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
