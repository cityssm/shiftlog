import type { Request, Response } from 'express'

import createWorkOrderMilestone, {
  type CreateWorkOrderMilestoneForm
} from '../../database/workOrders/createWorkOrderMilestone.js'

export type DoCreateWorkOrderMilestoneResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
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

  if (workOrderMilestoneId === undefined) {
    response.json({
      success: false,
      errorMessage: 'Work order not found.'
    })
    return
  }

  response.json({
    success: true,
    workOrderMilestoneId
  })
}
