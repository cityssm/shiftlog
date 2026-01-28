import type { Request, Response } from 'express'

import addShiftWorkOrder from '../../database/shifts/addShiftWorkOrder.js'
import getShiftWorkOrders, {
  type ShiftWorkOrder
} from '../../database/shifts/getShiftWorkOrders.js'
import isWorkOrderOnShift from '../../database/shifts/isWorkOrderOnShift.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export type DoAddShiftWorkOrderResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
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
      errorMessage: `This ${getConfigProperty('workOrders.sectionNameSingular')} is already assigned to the shift.`
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
      errorMessage: `Failed to add ${getConfigProperty('workOrders.sectionNameSingular')} to shift.`
    })
  }
}
