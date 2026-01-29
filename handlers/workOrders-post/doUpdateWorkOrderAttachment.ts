import type { Request, Response } from 'express'

import updateWorkOrderAttachment, {
  type UpdateWorkOrderAttachmentForm
} from '../../database/workOrders/updateWorkOrderAttachment.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderAttachmentResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderAttachmentForm>,
  response: Response<DoUpdateWorkOrderAttachmentResponse>
): Promise<void> {
  const success = await updateWorkOrderAttachment(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
