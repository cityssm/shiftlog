import type { Request, Response } from 'express'

import getShiftCrews from '../../database/shifts/getShiftCrews.js'
import type { ShiftCrew } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftCrewsResponse = {
  success: true
  shiftCrews: ShiftCrew[]
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoGetShiftCrewsResponse>
): Promise<void> {
  const shiftCrews = await getShiftCrews(
    request.body.shiftId,
    request.session.user
  )

  response.json({
    success: true,
    shiftCrews
  })
}
