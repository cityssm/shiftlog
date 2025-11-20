import type { Request, Response } from 'express'

import getWorkOrders, {
  type GetWorkOrdersFilters,
  type GetWorkOrdersOptions
} from '../../database/workOrders/getWorkOrders.js'
import type { WorkOrder } from '../../types/record.types.js'

export interface DoSearchWorkOrdersResponse {
  success: boolean

  workOrders: WorkOrder[]

  totalCount: number

  limit: number
  offset: number
}

export default async function handler(
  request: Request<unknown, unknown, GetWorkOrdersFilters & GetWorkOrdersOptions>,
  response: Response<DoSearchWorkOrdersResponse>
): Promise<void> {
  const workOrdersResults = await getWorkOrders(
    request.body,
    request.body,
    request.session.user
  )

  response.json({
    success: true,

    workOrders: workOrdersResults.workOrders,
    totalCount: workOrdersResults.totalCount,

    limit:
      typeof request.body.limit === 'number'
        ? request.body.limit
        : Number.parseInt(request.body.limit, 10),

    offset:
      typeof request.body.offset === 'number'
        ? request.body.offset
        : Number.parseInt(request.body.offset, 10)
  } satisfies DoSearchWorkOrdersResponse)
}
