import type { Request, Response } from 'express'

import updateShiftEmployee from '../../database/shifts/updateShiftEmployee.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftEmployeeResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoUpdateShiftEmployeeResponse>
): Promise<void> {
  const success = await updateShiftEmployee(request.body)

  response.json({
    success
  } satisfies DoUpdateShiftEmployeeResponse)
}
