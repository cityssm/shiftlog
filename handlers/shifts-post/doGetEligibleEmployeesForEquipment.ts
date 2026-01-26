import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import { getEligibleEmployeesForEquipment } from '../../helpers/equipment.helpers.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetEligibleEmployeesForEquipmentResponse = {
  success: boolean
  message?: string
  employees?: Employee[]
}

export default async function handler(
  request: Request,
  response: Response<DoGetEligibleEmployeesForEquipmentResponse>
): Promise<void> {
  const equipmentNumber = request.body.equipmentNumber as string

  if (!equipmentNumber) {
    response.status(400).json({
      success: false,
      message: 'Equipment number is required.'
    } satisfies DoGetEligibleEmployeesForEquipmentResponse)
    return
  }

  const allEmployees = await getEmployees()
  const eligibleEmployees = await getEligibleEmployeesForEquipment(
    equipmentNumber,
    allEmployees
  )

  response.json({
    success: true,
    employees: eligibleEmployees
  } satisfies DoGetEligibleEmployeesForEquipmentResponse)
}
