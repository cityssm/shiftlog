import type { Request, Response } from 'express'

import updateWorkOrderMilestone, {
  type UpdateWorkOrderMilestoneForm
} from '../../database/workOrders/updateWorkOrderMilestone.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderMilestoneResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderMilestoneForm>,
  response: Response<DoUpdateWorkOrderMilestoneResponse>
): Promise<void> {
  const success = await updateWorkOrderMilestone(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
