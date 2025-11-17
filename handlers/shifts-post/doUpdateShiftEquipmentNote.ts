import type { Request, Response } from 'express'

import updateShiftEquipmentNote from '../../database/shifts/updateShiftEquipmentNote.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateShiftEquipmentNote(request.body)

  response.json({
    success
  })
}
