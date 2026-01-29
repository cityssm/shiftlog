import type { Request, Response } from 'express'

import createWorkOrderCost, {
  type CreateWorkOrderCostForm
} from '../../database/workOrders/createWorkOrderCost.js'

export type DoCreateWorkOrderCostResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      workOrderCostId: number
    }

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderCostForm>,
  response: Response<DoCreateWorkOrderCostResponse>
): Promise<void> {
  const workOrderCostId = await createWorkOrderCost(
    request.body,
    request.session.user?.userName ?? ''
  )

  if (workOrderCostId === undefined) {
    response.json({
      success: false,
      errorMessage: 'Work order not found.'
    })
    return
  }

  response.json({
    success: true,
    workOrderCostId
  })
}
