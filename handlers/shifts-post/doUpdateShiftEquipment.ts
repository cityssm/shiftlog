import type { Request, Response } from 'express'

import updateShiftEquipment from '../../database/shifts/updateShiftEquipment.js'
import { validateEmployeeForEquipment } from '../../helpers/equipment.helpers.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftEquipmentResponse = {
  success: boolean
  message?: string
}

export default async function handler(
  request: Request,
  response: Response<DoUpdateShiftEquipmentResponse>
): Promise<void> {
  // Validate employee is allowed for this equipment
  const validation = await validateEmployeeForEquipment(
    request.body.equipmentNumber,
    request.body.employeeNumber
  )

  if (!validation.success) {
    response.status(400).json({
      success: false,
      message: validation.errorMessage
    } satisfies DoUpdateShiftEquipmentResponse)
    return
  }

  const success = await updateShiftEquipment(request.body)

  response.json({
    success
  } satisfies DoUpdateShiftEquipmentResponse)
}
