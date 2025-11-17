import type { Request, Response } from 'express'

import deleteShiftCrew from '../../database/shifts/deleteShiftCrew.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteShiftCrew(request.body)

  response.json({
    success
  })
}
