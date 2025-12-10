import type { Request, Response } from 'express'

import updateWorkOrderCost, {
  type UpdateWorkOrderCostForm
} from '../../database/workOrders/updateWorkOrderCost.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderCostForm>,
  response: Response
): Promise<void> {
  const success = await updateWorkOrderCost(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
