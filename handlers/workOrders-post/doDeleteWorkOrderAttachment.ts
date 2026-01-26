import type { Request, Response } from 'express'

import deleteWorkOrderAttachment from '../../database/workOrders/deleteWorkOrderAttachment.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderAttachmentResponse = {
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderAttachmentId: number | string }
  >,
  response: Response<DoDeleteWorkOrderAttachmentResponse>
): Promise<void> {
  const success = await deleteWorkOrderAttachment(
    request.body.workOrderAttachmentId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  } satisfies DoDeleteWorkOrderAttachmentResponse)
}
