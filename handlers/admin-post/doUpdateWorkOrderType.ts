import type { Request, Response } from 'express'

import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import updateWorkOrderType, {
  type UpdateWorkOrderTypeForm
} from '../../database/workOrderTypes/updateWorkOrderType.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

export type DoUpdateWorkOrderTypeResponse =
  | {
      message: string
      success: false
    }
  | {
      success: true
      workOrderTypes: WorkOrderType[]
    }

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderTypeForm>,
  response: Response<DoUpdateWorkOrderTypeResponse>
): Promise<void> {
  const success = await updateWorkOrderType(
    request.body,
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
      message: `${getConfigProperty('workOrders.sectionNameSingular')} Type could not be updated.`,
      success: false
    })
  }
}
