import type { Request, Response } from 'express'

import addWorkOrderType, {
  type AddWorkOrderTypeForm
} from '../../database/workOrderTypes/addWorkOrderType.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderTypeForm>,
  response: Response
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
      message: 'Work order type could not be added.',
      success: false
    })
  }
}
