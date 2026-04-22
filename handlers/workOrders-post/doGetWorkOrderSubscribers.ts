import type { Request, Response } from 'express'

import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js'
import type { WorkOrderSubscriber } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrderSubscribersResponse = {
  success: true
  subscribers: WorkOrderSubscriber[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetWorkOrderSubscribersResponse>
): Promise<void> {
  const subscribers = await getWorkOrderSubscribers(request.params.workOrderId)

  response.json({
    success: true,
    subscribers
  })
}
