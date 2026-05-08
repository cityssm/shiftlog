import type { Request, Response } from 'express'

import getWorkOrderEquipment, {
  type AvailableWorkOrderEquipment
} from '../../database/workOrders/getWorkOrderEquipment.js'
import type { WorkOrderEquipment } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrderEquipmentResponse = {
  success: true
  availableEquipment: AvailableWorkOrderEquipment[]
  workOrderEquipment: WorkOrderEquipment[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetWorkOrderEquipmentResponse>
): Promise<void> {
  const { availableEquipment, workOrderEquipment } = await getWorkOrderEquipment(
    request.params.workOrderId,
    request.session.user
  )

  response.json({
    success: true,
    availableEquipment,
    workOrderEquipment
  })
}
