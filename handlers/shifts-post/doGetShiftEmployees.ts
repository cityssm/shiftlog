import type { Request, Response } from 'express'

import getShiftEmployees from '../../database/shifts/getShiftEmployees.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response
): Promise<void> {
  const shiftEmployees = await getShiftEmployees(
    request.body.shiftId,
    request.session.user
  )

  response.json({
    success: true,
    shiftEmployees
  })
}
