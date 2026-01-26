import type { Request, Response } from 'express'

import updateWorkOrderMilestoneOrder, {
  type MilestoneOrderUpdate
} from '../../database/workOrders/updateWorkOrderMilestoneOrder.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderMilestoneOrderResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { milestoneOrders: MilestoneOrderUpdate[] }>,
  response: Response<DoUpdateWorkOrderMilestoneOrderResponse>
): Promise<void> {
  const success = await updateWorkOrderMilestoneOrder(
    request.body.milestoneOrders,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
