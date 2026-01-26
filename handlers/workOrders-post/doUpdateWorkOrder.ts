import type { Request, Response } from 'express'

import updateWorkOrder, {
  type UpdateWorkOrderForm
} from '../../database/workOrders/updateWorkOrder.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderForm>,
  response: Response<DoUpdateWorkOrderResponse>
): Promise<void> {
  const success = await updateWorkOrder(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  } satisfies DoUpdateWorkOrderResponse)
}
