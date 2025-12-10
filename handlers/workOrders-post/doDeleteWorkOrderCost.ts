import type { Request, Response } from 'express'

import deleteWorkOrderCost from '../../database/workOrders/deleteWorkOrderCost.js'

export interface DeleteWorkOrderCostForm {
  workOrderCostId: number | string
}

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderCostForm>,
  response: Response
): Promise<void> {
  const success = await deleteWorkOrderCost(
    request.body.workOrderCostId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
