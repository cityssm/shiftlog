import type { Request, Response } from 'express'

import deleteWorkOrderAttachment from '../../database/workOrders/deleteWorkOrderAttachment.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderAttachmentId: number | string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteWorkOrderAttachment(
    request.body.workOrderAttachmentId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
