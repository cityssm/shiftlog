import type { Request, Response } from 'express'

import updateWorkOrder, {
  type UpdateWorkOrderForm
} from '../../database/workOrders/updateWorkOrder.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderForm>,
  response: Response
): Promise<void> {
  const success = await updateWorkOrder(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
