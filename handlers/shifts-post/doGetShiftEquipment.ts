import type { Request, Response } from 'express'

import getShiftEquipment from '../../database/shifts/getShiftEquipment.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response
): Promise<void> {
  const shiftEquipment = await getShiftEquipment(
    request.body.shiftId,
    request.session.user
  )

  response.json({
    success: true,
    shiftEquipment
  })
}
