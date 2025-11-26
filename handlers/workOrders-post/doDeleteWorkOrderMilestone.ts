import type { Request, Response } from 'express'

import deleteWorkOrderMilestone from '../../database/workOrders/deleteWorkOrderMilestone.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneId: number | string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteWorkOrderMilestone(
    request.body.workOrderMilestoneId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
