import type { Request, Response } from 'express'

import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response
): Promise<void> {
  const shiftWorkOrders = await getShiftWorkOrders(request.body.shiftId)

  response.json({
    success: true,
    shiftWorkOrders
  })
}
