import type { Request, Response } from 'express'

import getDataListItems from '../../database/app/getDataListItems.js'
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
    request.session.user as User
  )

  response.render('admin/equipment', {
    equipment,
    equipmentTypes,
    headTitle: 'Equipment Maintenance',
    userGroups
  })
}
