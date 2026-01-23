import type { Request, Response } from 'express'

import deleteWorkOrderTag from '../../database/workOrders/deleteWorkOrderTag.js'
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'

interface DeleteWorkOrderTagForm {
  workOrderId: number
  tagName: string
}

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderTagForm>,
  response: Response
): Promise<void> {
  const success = await deleteWorkOrderTag(
    request.body.workOrderId,
    request.body.tagName
  )

  if (success) {
    const tags = await getWorkOrderTags(request.body.workOrderId)
    response.json({
      success: true,
      tags
    })
  } else {
    response.json({
      success: false,
      message: 'Tag could not be removed from work order.'
    })
  }
}
