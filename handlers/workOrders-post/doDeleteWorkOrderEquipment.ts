import type { Request, Response } from 'express'

import deleteWorkOrderEquipment from '../../database/workOrders/deleteWorkOrderEquipment.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

interface DeleteWorkOrderEquipmentForm {
  equipmentNumber: string
  workOrderId: number | string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderEquipmentResponse = {
  success: boolean

  errorMessage?: string
}

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderEquipmentForm>,
  response: Response<DoDeleteWorkOrderEquipmentResponse>
): Promise<void> {
  const userName = request.session.user?.userName

  if (userName === undefined || userName === '') {
    response.json({
      success: false,

      errorMessage: `Failed to remove equipment from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
    })
    return
  }

  const success = await deleteWorkOrderEquipment(request.body, userName)

  response.json({
    success,
    ...(success
      ? {}
      : {
          errorMessage: `Failed to remove equipment from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        })
  })
}
