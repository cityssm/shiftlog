import type { Request, Response } from 'express'

import updateWorkOrderMilestone, {
  type UpdateWorkOrderMilestoneForm
} from '../../database/workOrders/updateWorkOrderMilestone.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderMilestoneForm>,
  response: Response
): Promise<void> {
  const success = await updateWorkOrderMilestone(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
