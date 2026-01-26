import type { Request, Response } from 'express'

import getShiftEquipment from '../../database/shifts/getShiftEquipment.js'
import type { ShiftEquipment } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftEquipmentResponse = {
  success: true
  shiftEquipment: ShiftEquipment[]
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoGetShiftEquipmentResponse>
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
