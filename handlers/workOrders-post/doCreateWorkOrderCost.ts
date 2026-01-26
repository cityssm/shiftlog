import type { Request, Response } from 'express'

import createWorkOrderCost, {
  type CreateWorkOrderCostForm
} from '../../database/workOrders/createWorkOrderCost.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCreateWorkOrderCostResponse = {
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

  response.json({
    success: true,
    workOrderCostId
  })
}
