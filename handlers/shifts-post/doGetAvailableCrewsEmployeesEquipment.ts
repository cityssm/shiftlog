import type { Request, Response } from 'express'

import getCrews from '../../database/crews/getCrews.js'
import getEmployees from '../../database/employees/getEmployees.js'
import getEquipmentList from '../../database/equipment/getEquipmentList.js'
import type { Crew, Employee, Equipment } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetAvailableCrewsEmployeesEquipmentResponse = {
  success: true

  crews: Crew[]
  employees: Employee[]
  equipment: Equipment[]
}

export default async function handler(
  request: Request,
  response: Response<DoGetAvailableCrewsEmployeesEquipmentResponse>
): Promise<void> {
  const crews = await getCrews(request.session.user)
  const employees = await getEmployees()
  const equipment = await getEquipmentList()

  response.json({
    success: true,

    crews,
    employees,
    equipment
  })
}
