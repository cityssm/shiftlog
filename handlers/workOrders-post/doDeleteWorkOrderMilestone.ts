import type { Request, Response } from 'express'

import deleteWorkOrderMilestone from '../../database/workOrders/deleteWorkOrderMilestone.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderMilestoneResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { workOrderMilestoneId: number | string }>,
  response: Response<DoDeleteWorkOrderMilestoneResponse>
): Promise<void> {
  const success = await deleteWorkOrderMilestone(
    request.body.workOrderMilestoneId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
