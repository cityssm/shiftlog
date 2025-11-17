import type { Request, Response } from 'express'

import addShiftEmployee from '../../database/shifts/addShiftEmployee.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await addShiftEmployee(request.body)

  response.json({
    success
  })
}
