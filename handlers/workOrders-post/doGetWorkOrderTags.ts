import type { Request, Response } from 'express'

import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response
): Promise<void> {
  const tags = await getWorkOrderTags(Number(request.params.workOrderId))

  response.json({
    success: true,
    tags
  })
}
