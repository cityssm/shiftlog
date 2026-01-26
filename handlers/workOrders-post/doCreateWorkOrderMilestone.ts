import type { Request, Response } from 'express'

import createWorkOrderMilestone, {
  type CreateWorkOrderMilestoneForm
} from '../../database/workOrders/createWorkOrderMilestone.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCreateWorkOrderMilestoneResponse = {
  success: true
  workOrderMilestoneId: number
}

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderMilestoneForm>,
  response: Response<DoCreateWorkOrderMilestoneResponse>
): Promise<void> {
  const workOrderMilestoneId = await createWorkOrderMilestone(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success: true,
    workOrderMilestoneId
  })
}
