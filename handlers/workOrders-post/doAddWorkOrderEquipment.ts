import type { Request, Response } from 'express'

import addWorkOrderEquipment from '../../database/workOrders/addWorkOrderEquipment.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

interface AddWorkOrderEquipmentForm {
  equipmentNumber: string
  workOrderEquipmentNote?: string
  workOrderId: number | string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddWorkOrderEquipmentResponse = {
  success: boolean

  errorMessage?: string
}

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderEquipmentForm>,
  response: Response<DoAddWorkOrderEquipmentResponse>
): Promise<void> {
  const userName = request.session.user?.userName

  if (userName === undefined || userName === '') {
    response.json({
      success: false,

      errorMessage: `Failed to add equipment to ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
    })
    return
  }

  const success = await addWorkOrderEquipment(request.body, userName)

  response.json({
    success,
    ...(success
      ? {}
      : {
          errorMessage: `Failed to add equipment to ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        })
  })
}
