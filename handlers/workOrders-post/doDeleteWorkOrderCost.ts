import type { Request, Response } from 'express'

import deleteWorkOrderCost from '../../database/workOrders/deleteWorkOrderCost.js'

export interface DeleteWorkOrderCostForm {
  workOrderCostId: number | string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderCostResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderCostForm>,
  response: Response<DoDeleteWorkOrderCostResponse>
): Promise<void> {
  const success = await deleteWorkOrderCost(
    request.body.workOrderCostId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
