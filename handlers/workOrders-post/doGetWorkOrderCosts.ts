import type { Request, Response } from 'express'

import getWorkOrderCosts from '../../database/workOrders/getWorkOrderCosts.js'

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response
): Promise<void> {
  const costs = await getWorkOrderCosts(request.params.workOrderId)

  response.json({
    success: true,
    costs
  })
}
