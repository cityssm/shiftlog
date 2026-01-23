import type { Request, Response } from 'express'

import addWorkOrderTag from '../../database/workOrders/addWorkOrderTag.js'
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'

interface AddWorkOrderTagForm {
  workOrderId: number
  tagName: string
}

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderTagForm>,
  response: Response
): Promise<void> {
  const success = await addWorkOrderTag(
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
      message: 'Tag could not be added to work order.'
    })
  }
}
