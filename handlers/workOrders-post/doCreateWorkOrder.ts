import type { Request, Response } from 'express'

import createWorkOrder, {
  type CreateWorkOrderForm
} from '../../database/workOrders/createWorkOrder.js'

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderForm>,
  response: Response
): Promise<void> {
  const workOrderId = await createWorkOrder(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success: true,

    workOrderId
  })
}
