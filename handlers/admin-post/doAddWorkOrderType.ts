import type { Request, Response } from 'express'

import addWorkOrderType, {
  type AddWorkOrderTypeForm
} from '../../database/workOrderTypes/addWorkOrderType.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

export type DoAddWorkOrderTypeResponse =
  | {
      message: string
      success: false
    }
  | {
      success: true
      workOrderTypes: WorkOrderType[]
    }

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderTypeForm>,
  response: Response<DoAddWorkOrderTypeResponse>
): Promise<void> {
  const workOrderTypeId = await addWorkOrderType(
    request.body,
    request.session.user?.userName ?? ''
  )

  if (workOrderTypeId > 0) {
    const workOrderTypes = await getWorkOrderTypesAdmin()
    response.json({
      success: true,
      workOrderTypes
    })
  } else {
    response.json({
      message: `${getConfigProperty('workOrders.sectionNameSingular')} Type could not be added.`,
      success: false
    })
  }
}
