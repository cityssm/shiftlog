import type { Request, Response } from 'express'

import addShiftEquipment from '../../database/shifts/addShiftEquipment.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await addShiftEquipment(request.body)

  response.json({
    success
  })
}
