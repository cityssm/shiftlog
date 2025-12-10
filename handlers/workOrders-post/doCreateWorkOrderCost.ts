import type { Request, Response } from 'express'

import createWorkOrderCost, {
  type CreateWorkOrderCostForm
} from '../../database/workOrders/createWorkOrderCost.js'

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderCostForm>,
  response: Response
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
