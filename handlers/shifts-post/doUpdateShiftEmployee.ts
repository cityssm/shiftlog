import type { Request, Response } from 'express'

import updateShiftEmployee from '../../database/shifts/updateShiftEmployee.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateShiftEmployee(request.body)

  response.json({
    success
  })
}
