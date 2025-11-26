import type { Request, Response } from 'express'

import getWorkOrderMilestones from '../../database/workOrders/getWorkOrderMilestones.js'

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response
): Promise<void> {
  const milestones = await getWorkOrderMilestones(request.params.workOrderId)

  response.json({
    success: true,
    milestones
  })
}
