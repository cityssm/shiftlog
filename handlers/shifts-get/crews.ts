import type { Request, Response } from 'express'

import getCrews from '../../database/crews/getCrews.js'
import getEmployees from '../../database/employees/getEmployees.js'
import getEquipmentList from '../../database/equipment/getEquipmentList.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const crews = await getCrews()
  const employees = await getEmployees()
  const equipment = await getEquipmentList()
  const userGroups = await getUserGroups()

  response.render('shifts/crews', {
    headTitle: 'Crew Maintenance',
    section: 'shifts',

    crews,
    employees,
    equipment,
    userGroups
  })
}
