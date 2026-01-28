import type { Request, Response } from 'express'

import deleteShiftWorkOrder from '../../database/shifts/deleteShiftWorkOrder.js'
import getShiftWorkOrders, {
  type ShiftWorkOrder
} from '../../database/shifts/getShiftWorkOrders.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export type DoDeleteShiftWorkOrderResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      shiftWorkOrders: ShiftWorkOrder[]
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
    })
  } else {
    response.json({
      success: false,
      errorMessage: `Failed to remove ${getConfigProperty('workOrders.sectionNameSingular')} from shift.`
    })
  }
}
