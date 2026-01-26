import type { Request, Response } from 'express'

import getShiftEmployees from '../../database/shifts/getShiftEmployees.js'
import type { ShiftEmployee } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftEmployeesResponse = {
  success: true
  shiftEmployees: ShiftEmployee[]
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoGetShiftEmployeesResponse>
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
