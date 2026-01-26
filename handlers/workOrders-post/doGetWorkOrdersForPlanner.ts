import type { Request, Response } from 'express'

import getWorkOrdersForPlanner, {
  type GetWorkOrdersForPlannerFilters,
  type GetWorkOrdersForPlannerOptions
} from '../../database/workOrders/getWorkOrdersForPlanner.js'
import type { WorkOrder } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrdersForPlannerResponse = {
  success: boolean

  workOrders: WorkOrder[]

  totalCount: number

  limit: number
  offset: number
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    GetWorkOrdersForPlannerFilters & GetWorkOrdersForPlannerOptions
  >,
  response: Response<DoGetWorkOrdersForPlannerResponse>
): Promise<void> {
  const workOrdersResults = await getWorkOrdersForPlanner(
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
  } satisfies DoGetWorkOrdersForPlannerResponse)
}
