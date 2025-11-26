import type { Request, Response } from 'express'

import updateWorkOrderMilestoneOrder, {
  type MilestoneOrderUpdate
} from '../../database/workOrders/updateWorkOrderMilestoneOrder.js'

export default async function handler(
  request: Request<unknown, unknown, { milestoneOrders: MilestoneOrderUpdate[] }>,
  response: Response
): Promise<void> {
  const success = await updateWorkOrderMilestoneOrder(
    request.body.milestoneOrders,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
