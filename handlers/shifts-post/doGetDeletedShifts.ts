import type { Request, Response } from 'express'

import getDeletedShifts from '../../database/shifts/getDeletedShifts.js'
import type { Shift } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetDeletedShiftsResponse = {
  success: true
  shifts: Shift[]
}

export default async function handler(
  request: Request,
  response: Response<DoGetDeletedShiftsResponse>
): Promise<void> {
  const shifts = await getDeletedShifts(request.session.user)

  response.json({
    success: true,
    shifts
  })
}
