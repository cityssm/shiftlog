import type { Request, Response } from 'express'

import createWorkOrderMilestone, {
  type CreateWorkOrderMilestoneForm
} from '../../database/workOrders/createWorkOrderMilestone.js'

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderMilestoneForm>,
  response: Response
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
