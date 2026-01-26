import type { Request, Response } from 'express'

import updateWorkOrderCost, {
  type UpdateWorkOrderCostForm
} from '../../database/workOrders/updateWorkOrderCost.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderCostResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderCostForm>,
  response: Response<DoUpdateWorkOrderCostResponse>
): Promise<void> {
  const success = await updateWorkOrderCost(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
