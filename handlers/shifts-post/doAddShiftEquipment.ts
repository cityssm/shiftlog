import type { Request, Response } from 'express'

import addShiftEquipment from '../../database/shifts/addShiftEquipment.js'
import { validateEmployeeForEquipment } from '../../helpers/equipment.helpers.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddShiftEquipmentResponse = {
  success: boolean
  message?: string
}

export default async function handler(
  request: Request,
  response: Response<DoAddShiftEquipmentResponse>
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
    })

    return
  }

  const success = await addShiftEquipment(request.body)

  response.json({
    success
  })
}
