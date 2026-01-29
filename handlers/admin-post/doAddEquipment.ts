import type { Request, Response } from 'express'

import addEquipment from '../../database/equipment/addEquipment.js'
import getEquipmentList from '../../database/equipment/getEquipmentList.js'
import type { Equipment } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddEquipmentResponse = {
  equipment: Equipment[]
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      equipmentDescription: string
      equipmentName: string
      equipmentNumber: string
      equipmentTypeDataListItemId: string
      employeeListId: string
      userGroupId: string
    }
  >,
  response: Response<DoAddEquipmentResponse>
): Promise<void> {
  const success = await addEquipment(
    {
      equipmentNumber: request.body.equipmentNumber,
      equipmentName: request.body.equipmentName,
      equipmentDescription: request.body.equipmentDescription,
      equipmentTypeDataListItemId: Number.parseInt(
        request.body.equipmentTypeDataListItemId,
        10
      ),
      employeeListId:
        request.body.employeeListId === ''
          ? undefined
          : Number.parseInt(request.body.employeeListId, 10),
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
