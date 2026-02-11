import type { Request, Response } from 'express'

import deleteWorkOrderTag from '../../database/workOrders/deleteWorkOrderTag.js'
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderTag } from '../../types/record.types.js'

interface DeleteWorkOrderTagForm {
  workOrderId: number
  tagName: string
}

export type DoDeleteWorkOrderTagResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      tags: WorkOrderTag[]
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
    })
  } else {
    response.json({
      success: false,
      errorMessage: `Failed to remove tag from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
    })
  }
}
