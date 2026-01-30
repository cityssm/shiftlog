import type { Request, Response } from 'express'

import getDataListItems from '../../database/app/getDataListItems.js'
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js'
import getEquipmentList from '../../database/equipment/getEquipmentList.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const equipment = await getEquipmentList()
  const userGroups = await getUserGroups()
  const equipmentTypes = await getDataListItems(
    'equipmentTypes',
    request.session.user?.userName
  )
  const employeeLists = await getEmployeeLists()

  response.render('admin/equipment', {
    headTitle: 'Equipment Maintenance',
    section: 'admin',

    employeeLists,
    equipment,
    equipmentTypes,
    userGroups
  })
}
