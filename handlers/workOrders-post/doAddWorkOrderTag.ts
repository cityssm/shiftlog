import type { Request, Response } from 'express'

import addWorkOrderTag from '../../database/workOrders/addWorkOrderTag.js'
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderTag } from '../../types/record.types.js'

interface AddWorkOrderTagForm {
  workOrderId: number
  tagName: string
}

export type DoAddWorkOrderTagResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      tags: WorkOrderTag[]
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
    })
  } else {
    response.json({
      success: false,
      errorMessage: `Failed to add tag to ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
    })
  }
}
