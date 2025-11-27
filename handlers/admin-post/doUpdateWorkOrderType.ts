import type { Request, Response } from 'express'

import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import updateWorkOrderType from '../../database/workOrderTypes/updateWorkOrderType.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrderTypeId = request.body.workOrderTypeId
  const workOrderType = request.body.workOrderType as string
  const workOrderNumberPrefix = (request.body.workOrderNumberPrefix as string) || ''
  const userGroupId = request.body.userGroupId

  const success = await updateWorkOrderType(
    { workOrderTypeId, workOrderType, workOrderNumberPrefix, userGroupId },
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
      message: 'Work order type could not be updated.'
    })
  }
}
