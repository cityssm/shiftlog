import type { Request, Response } from 'express'

import deleteWorkOrderType from '../../database/workOrderTypes/deleteWorkOrderType.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

interface DeleteWorkOrderTypeForm {
  workOrderTypeId: number | string
}

export type DoDeleteWorkOrderTypeResponse =
  | {
      message: string
      success: false
    }
  | {
      success: true
      workOrderTypes: WorkOrderType[]
    }

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderTypeForm>,
  response: Response<DoDeleteWorkOrderTypeResponse>
): Promise<void> {
  const success = await deleteWorkOrderType(
    request.body.workOrderTypeId,
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
      message: `${getConfigProperty('workOrders.sectionName')} Type could not be deleted.`,
      success: false
    })
  }
}
