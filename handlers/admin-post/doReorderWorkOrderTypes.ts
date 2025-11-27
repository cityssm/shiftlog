import type { Request, Response } from 'express'

import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import reorderWorkOrderTypes from '../../database/workOrderTypes/reorderWorkOrderTypes.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrderTypeIds = request.body.workOrderTypeIds as Array<number | string>

  const success = await reorderWorkOrderTypes(
    workOrderTypeIds,
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
      message: 'Work order types could not be reordered.'
    })
  }
}
