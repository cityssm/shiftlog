import type { Request, Response } from 'express'

import getEquipment from '../../database/equipment/getEquipment.js'
import updateEquipment from '../../database/equipment/updateEquipment.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      equipmentNumber: string
      equipmentName: string
      equipmentDescription: string
      equipmentTypeDataListItemId: string
      userGroupId: string
    }
  >,
  response: Response
): Promise<void> {
  const success = await updateEquipment(
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
    success,
    equipment
  })
}
