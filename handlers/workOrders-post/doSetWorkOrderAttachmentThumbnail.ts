import type { Request, Response } from 'express'

import setWorkOrderAttachmentThumbnail from '../../database/workOrders/setWorkOrderAttachmentThumbnail.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderAttachmentId: number | string }
  >,
  response: Response
): Promise<void> {
  const success = await setWorkOrderAttachmentThumbnail(
    request.body.workOrderAttachmentId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
