import type { Request, Response } from 'express'

import getWorkOrderAttachments from '../../database/workOrders/getWorkOrderAttachments.js'
import type { WorkOrderAttachment } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrderAttachmentsResponse = {
  success: boolean
  attachments: WorkOrderAttachment[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetWorkOrderAttachmentsResponse>
): Promise<void> {
  const attachments = await getWorkOrderAttachments(request.params.workOrderId)

  response.json({
    success: true,
    attachments
  } satisfies DoGetWorkOrderAttachmentsResponse)
}
