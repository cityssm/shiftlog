import type { Request, Response } from 'express'

import deleteWorkOrderType from '../../database/workOrderTypes/deleteWorkOrderType.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'

interface DeleteWorkOrderTypeForm {
  workOrderTypeId: number | string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderTypeResponse =
  | {
      success: true
      workOrderTypes: Awaited<ReturnType<typeof getWorkOrderTypesAdmin>>
    }
  | {
      message: string
      success: false
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
    } satisfies DoDeleteWorkOrderTypeResponse)
  } else {
    response.json({
      message: 'Work order type could not be deleted.',
      success: false
    } satisfies DoDeleteWorkOrderTypeResponse)
  }
}
