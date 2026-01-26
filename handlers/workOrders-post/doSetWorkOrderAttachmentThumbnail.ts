import type { Request, Response } from 'express'

import setWorkOrderAttachmentThumbnail from '../../database/workOrders/setWorkOrderAttachmentThumbnail.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoSetWorkOrderAttachmentThumbnailResponse = {
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderAttachmentId: number | string }
  >,
  response: Response<DoSetWorkOrderAttachmentThumbnailResponse>
): Promise<void> {
  const success = await setWorkOrderAttachmentThumbnail(
    request.body.workOrderAttachmentId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  } satisfies DoSetWorkOrderAttachmentThumbnailResponse)
}
