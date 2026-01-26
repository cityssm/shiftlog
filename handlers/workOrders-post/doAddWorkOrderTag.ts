import type { Request, Response } from 'express'

import addWorkOrderTag from '../../database/workOrders/addWorkOrderTag.js'
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'
import type { WorkOrderTag } from '../../types/record.types.js'

interface AddWorkOrderTagForm {
  workOrderId: number
  tagName: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddWorkOrderTagResponse = {
  success: boolean
  tags?: WorkOrderTag[]
  message?: string
}

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderTagForm>,
  response: Response<DoAddWorkOrderTagResponse>
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
    } satisfies DoAddWorkOrderTagResponse)
  } else {
    response.json({
      success: false,
      message: 'Tag could not be added to work order.'
    } satisfies DoAddWorkOrderTagResponse)
  }
}
