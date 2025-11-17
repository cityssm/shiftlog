import type { Request, Response } from 'express'

import deleteShiftEquipment from '../../database/shifts/deleteShiftEquipment.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteShiftEquipment(request.body)

  response.json({
    success
  })
}
