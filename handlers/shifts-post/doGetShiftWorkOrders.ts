import type { Request, Response } from 'express'

import getShiftWorkOrders, {
  type ShiftWorkOrder
} from '../../database/shifts/getShiftWorkOrders.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftWorkOrdersResponse = {
  success: true
  shiftWorkOrders: ShiftWorkOrder[]
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoGetShiftWorkOrdersResponse>
): Promise<void> {
  const shiftWorkOrders = await getShiftWorkOrders(request.body.shiftId)

  response.json({
    success: true,
    shiftWorkOrders
  })
}
