import type { Request, Response } from 'express'

import updateWorkOrder, {
  type UpdateWorkOrderForm
} from '../../database/workOrders/updateWorkOrder.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderResponse = { recordUpdate_timeMillis?: number } & (
  | {
      success: true
    }
  | {
      success: false
      message: string
    }
)

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderForm>,
  response: Response<DoUpdateWorkOrderResponse>
): Promise<void> {
  try {
    const recordUpdate_timeMillis = await updateWorkOrder(
      request.body,
      request.session.user?.userName ?? ''
    )

    response.json({
      success: true,
      recordUpdate_timeMillis
    })
  } catch (error) {
    console.error(error)
    response.json({
      success: false,
      message: (error as Error).message
    })
  }
}
