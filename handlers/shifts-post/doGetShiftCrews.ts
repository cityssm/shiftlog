import type { Request, Response } from 'express'

import getShiftCrews from '../../database/shifts/getShiftCrews.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response
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
