import type { Request, Response } from 'express'

import addShiftWorkOrder from '../../database/shifts/addShiftWorkOrder.js'
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js'

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
  response: Response
): Promise<void> {
  // Check if work order is already on this shift
  const existingWorkOrders = await getShiftWorkOrders(request.body.shiftId)
  const workOrderId = Number(request.body.workOrderId)
  
  const alreadyExists = existingWorkOrders.some(
    (wo) => wo.workOrderId === workOrderId
  )

  if (alreadyExists) {
    response.json({
      success: false,
      errorMessage: 'This work order is already assigned to the shift.'
    })
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
    })
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to add work order to shift.'
    })
  }
}
