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
  const success = await deleteWorkOrderEquipment(request.body)

  response.json({
    success,
    ...(success
      ? {}
      : {
          errorMessage: `Failed to remove equipment from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        })
  })
}
