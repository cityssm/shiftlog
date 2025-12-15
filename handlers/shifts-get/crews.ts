import type { Request, Response } from 'express'

import getCrews from '../../database/crews/getCrews.js'
import getEmployees from '../../database/employees/getEmployees.js'
import getEquipment from '../../database/equipment/getEquipment.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const crews = await getCrews()
  const employees = await getEmployees()
  const equipment = await getEquipment()
  const userGroups = await getUserGroups()

  response.render('shifts/crews', {
    crews,
    employees,
    equipment,
    headTitle: 'Crew Maintenance',
    userGroups
  })
}
