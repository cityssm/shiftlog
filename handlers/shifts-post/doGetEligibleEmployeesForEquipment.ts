import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import { getEligibleEmployeesForEquipment } from '../../helpers/equipment.helpers.js'
import type { Employee } from '../../types/record.types.js'

export type DoGetEligibleEmployeesForEquipmentResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      employees: Employee[]
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
    })
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
  })
}
