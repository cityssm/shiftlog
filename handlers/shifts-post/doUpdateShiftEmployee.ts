import type { Request, Response } from 'express'

import updateShiftEmployee, {
  type UpdateShiftEmployeeForm
} from '../../database/shifts/updateShiftEmployee.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftEmployeeResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateShiftEmployeeForm>,
  response: Response<DoUpdateShiftEmployeeResponse>
): Promise<void> {
  const success = await updateShiftEmployee(request.body)

  response.json({
    success
  })
}
