import type { Request, Response } from 'express'

import createWorkOrder, {
  type CreateWorkOrderForm
} from '../../database/workOrders/createWorkOrder.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCreateWorkOrderResponse = {
  success: boolean
  workOrderId: number
}

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderForm>,
  response: Response<DoCreateWorkOrderResponse>
): Promise<void> {
  const workOrderId = await createWorkOrder(
    request.body,
    request.session.user as User
  )

  response.json({
    success: true,

    workOrderId
  })
}
