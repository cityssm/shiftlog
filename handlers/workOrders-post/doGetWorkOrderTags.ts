import type { Request, Response } from 'express'

import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'
import type { WorkOrderTag } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrderTagsResponse = {
  success: boolean
  tags: WorkOrderTag[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetWorkOrderTagsResponse>
): Promise<void> {
  const tags = await getWorkOrderTags(Number(request.params.workOrderId))

  response.json({
    success: true,
    tags
  } satisfies DoGetWorkOrderTagsResponse)
}
