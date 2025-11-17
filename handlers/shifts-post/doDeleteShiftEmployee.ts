import type { Request, Response } from 'express'

import deleteShiftEmployee from '../../database/shifts/deleteShiftEmployee.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteShiftEmployee(request.body)

  response.json({
    success
  })
}
