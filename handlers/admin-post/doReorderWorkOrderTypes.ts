import type { Request, Response } from 'express'

import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import reorderWorkOrderTypes from '../../database/workOrderTypes/reorderWorkOrderTypes.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

interface ReorderWorkOrderTypesForm {
  workOrderTypeIds: Array<number | string>
}

export type DoReorderWorkOrderTypesResponse =
  | {
      message: string
      success: false
    }
  | {
      success: true
      workOrderTypes: WorkOrderType[]
    }

export default async function handler(
  request: Request<unknown, unknown, ReorderWorkOrderTypesForm>,
  response: Response<DoReorderWorkOrderTypesResponse>
): Promise<void> {
  const success = await reorderWorkOrderTypes(
    request.body.workOrderTypeIds,
    request.session.user?.userName ?? ''
  )

  if (success) {
    const workOrderTypes = await getWorkOrderTypesAdmin()

    response.json({
      success: true,
      workOrderTypes
    })
  } else {
    response.json({
      message: `${getConfigProperty('workOrders.sectionNameSingular')} Types could not be reordered.`,
      success: false
    })
  }
}
