import type { Request, Response } from 'express'

import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import updateWorkOrderType, {
  type UpdateWorkOrderTypeForm
} from '../../database/workOrderTypes/updateWorkOrderType.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderTypeResponse =
  | {
      success: true
      workOrderTypes: Awaited<ReturnType<typeof getWorkOrderTypesAdmin>>
    }
  | {
      message: string
      success: false
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
    } satisfies DoUpdateWorkOrderTypeResponse)
  } else {
    response.json({
      message: 'Work order type could not be updated.',
      success: false
    } satisfies DoUpdateWorkOrderTypeResponse)
  }
}
