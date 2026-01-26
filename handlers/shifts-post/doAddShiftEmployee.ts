import type { Request, Response } from 'express'

import addShiftEmployee from '../../database/shifts/addShiftEmployee.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddShiftEmployeeResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoAddShiftEmployeeResponse>
): Promise<void> {
  const success = await addShiftEmployee(request.body)

  response.json({
    success
  } satisfies DoAddShiftEmployeeResponse)
}
