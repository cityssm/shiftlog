import type { Request, Response } from 'express'

import deleteWorkOrderType from '../../database/workOrderTypes/deleteWorkOrderType.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'

interface DeleteWorkOrderTypeForm {
  workOrderTypeId: number | string
}

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderTypeForm>,
  response: Response
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
      message: 'Work order type could not be deleted.',
      success: false
    })
  }
}
