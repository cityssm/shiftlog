import type { Request, Response } from 'express'

import ignoreWorkOrderAttachment from '../../database/workOrders/ignoreWorkOrderAttachment.js'

export type DoIgnoreWorkOrderAttachmentResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
    }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { noteText: string; workOrderAttachmentId: number | string }
  >,
  response: Response<DoIgnoreWorkOrderAttachmentResponse>
): Promise<void> {
  const success = await ignoreWorkOrderAttachment(
    request.body.workOrderAttachmentId,
    request.body.noteText.trim(),
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true
    })
  } else {
    response.json({
      success: false,
      message:
        'The attachment could not be ignored. Ensure the attachment has a checksum.'
    })
  }
}
