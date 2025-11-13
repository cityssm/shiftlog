import type { Request, Response } from 'express'

import getDataListItems from '../../database/app/getDataListItems.js'
import getEquipment from '../../database/equipment/getEquipment.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const equipment = await getEquipment()
  const userGroups = await getUserGroups()
  const equipmentTypes = await getDataListItems(
    'equipmentTypes',
    (request.session.user as User).userName
  )

  response.render('admin/equipment', {
    equipment,
    equipmentTypes,
    headTitle: 'Equipment Maintenance',
    userGroups
  })
}
