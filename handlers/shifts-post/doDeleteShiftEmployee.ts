import type { Request, Response } from 'express'

import deleteShiftEmployee from '../../database/shifts/deleteShiftEmployee.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteShiftEmployeeResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoDeleteShiftEmployeeResponse>
): Promise<void> {
  const success = await deleteShiftEmployee(request.body)

  response.json({
    success
  })
}
