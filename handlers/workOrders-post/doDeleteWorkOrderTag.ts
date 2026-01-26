import type { Request, Response } from 'express'

import deleteWorkOrderTag from '../../database/workOrders/deleteWorkOrderTag.js'
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'
import type { WorkOrderTag } from '../../types/record.types.js'

interface DeleteWorkOrderTagForm {
  workOrderId: number
  tagName: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderTagResponse = {
  success: boolean
  tags?: WorkOrderTag[]
  message?: string
}

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderTagForm>,
  response: Response<DoDeleteWorkOrderTagResponse>
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
    } satisfies DoDeleteWorkOrderTagResponse)
  } else {
    response.json({
      success: false,
      message: 'Tag could not be removed from work order.'
    } satisfies DoDeleteWorkOrderTagResponse)
  }
}
