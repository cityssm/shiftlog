import type { Request, Response } from 'express'

import getCrews from '../../database/crews/getCrews.js'
import getEmployees from '../../database/employees/getEmployees.js'
import getEquipment from '../../database/equipment/getEquipment.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const crews = await getCrews(request.session.user)
  const employees = await getEmployees()
  const equipment = await getEquipment()

  response.json({
    success: true,
    crews,
    employees,
    equipment
  })
}
