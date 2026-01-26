import type { Request, Response } from 'express'

import addShiftWorkOrder from '../../database/shifts/addShiftWorkOrder.js'
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js'
import isWorkOrderOnShift from '../../database/shifts/isWorkOrderOnShift.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddShiftWorkOrderResponse = {
  success: boolean
  errorMessage?: string
  shiftWorkOrders?: ShiftWorkOrder[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      shiftId: number | string
      workOrderId: number | string
      shiftWorkOrderNote: string
    }
  >,
  response: Response<DoAddShiftWorkOrderResponse>
): Promise<void> {
  // Check if work order is already on this shift
  const alreadyExists = await isWorkOrderOnShift(
    request.body.shiftId,
    request.body.workOrderId
  )

  if (alreadyExists) {
    response.json({
      success: false,
      errorMessage: 'This work order is already assigned to the shift.'
    } satisfies DoAddShiftWorkOrderResponse)
    return
  }

  const success = await addShiftWorkOrder(
    request.body.shiftId,
    request.body.workOrderId,
    request.body.shiftWorkOrderNote
  )

  if (success) {
    const shiftWorkOrders = await getShiftWorkOrders(request.body.shiftId)

    response.json({
      success: true,
      shiftWorkOrders
    } satisfies DoAddShiftWorkOrderResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to add work order to shift.'
    } satisfies DoAddShiftWorkOrderResponse)
  }
}
