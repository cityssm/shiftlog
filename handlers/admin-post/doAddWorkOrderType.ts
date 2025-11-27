import type { Request, Response } from 'express'

import addWorkOrderType from '../../database/workOrderTypes/addWorkOrderType.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrderType = request.body.workOrderType as string
  const workOrderNumberPrefix = (request.body.workOrderNumberPrefix as string) || ''
  const userGroupId = request.body.userGroupId

  const workOrderTypeId = await addWorkOrderType(
    { workOrderType, workOrderNumberPrefix, userGroupId },
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
      success: false,
      message: 'Work order type could not be added.'
    })
  }
}
