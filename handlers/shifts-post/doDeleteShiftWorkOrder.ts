import type { Request, Response } from 'express'

import deleteShiftWorkOrder from '../../database/shifts/deleteShiftWorkOrder.js'
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteShiftWorkOrderResponse = {
  success: boolean
  errorMessage?: string
  shiftWorkOrders?: Awaited<ReturnType<typeof getShiftWorkOrders>>
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      shiftId: number | string
      workOrderId: number | string
    }
  >,
  response: Response<DoDeleteShiftWorkOrderResponse>
): Promise<void> {
  const success = await deleteShiftWorkOrder(
    request.body.shiftId,
    request.body.workOrderId
  )

  if (success) {
    const shiftWorkOrders = await getShiftWorkOrders(request.body.shiftId)

    response.json({
      success: true,
      shiftWorkOrders
    } satisfies DoDeleteShiftWorkOrderResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to remove work order from shift.'
    } satisfies DoDeleteShiftWorkOrderResponse)
  }
}
