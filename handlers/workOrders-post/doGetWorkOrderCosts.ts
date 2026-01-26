import type { Request, Response } from 'express'

import getWorkOrderCosts from '../../database/workOrders/getWorkOrderCosts.js'
import type { WorkOrderCost } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrderCostsResponse = {
  success: boolean
  costs: WorkOrderCost[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetWorkOrderCostsResponse>
): Promise<void> {
  const costs = await getWorkOrderCosts(request.params.workOrderId)

  response.json({
    success: true,
    costs
  } satisfies DoGetWorkOrderCostsResponse)
}
