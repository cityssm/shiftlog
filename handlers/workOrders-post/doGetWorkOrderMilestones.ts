import type { Request, Response } from 'express'

import getWorkOrderMilestones from '../../database/workOrders/getWorkOrderMilestones.js'
import type { WorkOrderMilestone } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrderMilestonesResponse = {
  success: boolean
  milestones: WorkOrderMilestone[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetWorkOrderMilestonesResponse>
): Promise<void> {
  const milestones = await getWorkOrderMilestones(request.params.workOrderId)

  response.json({
    success: true,
    milestones
  } satisfies DoGetWorkOrderMilestonesResponse)
}
