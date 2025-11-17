import type { Request, Response } from 'express'

import updateShiftEquipment from '../../database/shifts/updateShiftEquipment.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateShiftEquipment(request.body)

  response.json({
    success
  })
}
