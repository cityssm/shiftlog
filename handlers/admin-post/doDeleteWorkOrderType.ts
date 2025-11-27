import type { Request, Response } from 'express'

import deleteWorkOrderType from '../../database/workOrderTypes/deleteWorkOrderType.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrderTypeId = request.body.workOrderTypeId

  const success = await deleteWorkOrderType(
    workOrderTypeId,
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
      success: false,
      message: 'Work order type could not be deleted.'
    })
  }
}
