import type { Request, Response } from 'express'

import addEquipment from '../../database/equipment/addEquipment.js'
import getEquipment from '../../database/equipment/getEquipment.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      equipmentDescription: string
      equipmentName: string
      equipmentNumber: string
      equipmentTypeDataListItemId: string
      userGroupId: string
    }
  >,
  response: Response
): Promise<void> {
  const success = await addEquipment(
    request.body.equipmentNumber,
    request.body.equipmentName,
    request.body.equipmentDescription,
    Number.parseInt(request.body.equipmentTypeDataListItemId, 10),
    request.body.userGroupId === ''
      ? undefined
      : Number.parseInt(request.body.userGroupId, 10),
    request.session.user as User
  )

  const equipment = await getEquipment()

  response.json({
    equipment,
    success
  })
}
