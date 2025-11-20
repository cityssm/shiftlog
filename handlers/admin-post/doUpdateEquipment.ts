import type { Request, Response } from 'express'

import getEquipmentList from '../../database/equipment/getEquipmentList.js'
import updateEquipment from '../../database/equipment/updateEquipment.js'

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
      recordSync_isSynced?: string
    }
  >,
  response: Response
): Promise<void> {
  const success = await updateEquipment(
    {
      equipmentNumber: request.body.equipmentNumber,
      equipmentName: request.body.equipmentName,
      equipmentDescription: request.body.equipmentDescription,
      equipmentTypeDataListItemId: Number.parseInt(
        request.body.equipmentTypeDataListItemId,
        10
      ),
      recordSync_isSynced: request.body.recordSync_isSynced === '1',
      userGroupId:
        request.body.userGroupId === ''
          ? undefined
          : Number.parseInt(request.body.userGroupId, 10)
    },
    request.session.user as User
  )

  const equipment = await getEquipmentList()

  response.json({
    equipment,
    success
  })
}
