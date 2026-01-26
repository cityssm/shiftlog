import type { Request, Response } from 'express'

import deleteShiftEquipment from '../../database/shifts/deleteShiftEquipment.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteShiftEquipmentResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoDeleteShiftEquipmentResponse>
): Promise<void> {
  const success = await deleteShiftEquipment(request.body)

  response.json({
    success
  })
}
