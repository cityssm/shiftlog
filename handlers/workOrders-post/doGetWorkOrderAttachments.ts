import type { Request, Response } from 'express'

import getWorkOrderAttachments from '../../database/workOrders/getWorkOrderAttachments.js'

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response
): Promise<void> {
  const attachments = await getWorkOrderAttachments(request.params.workOrderId)

  response.json({
    success: true,
    attachments
  })
}
