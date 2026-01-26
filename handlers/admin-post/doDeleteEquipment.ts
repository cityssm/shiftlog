import type { Request, Response } from 'express'

import deleteEquipment from '../../database/equipment/deleteEquipment.js'
import getEquipmentList from '../../database/equipment/getEquipmentList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteEquipmentResponse = {
  equipment: Awaited<ReturnType<typeof getEquipmentList>>
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { equipmentNumber: string }>,
  response: Response<DoDeleteEquipmentResponse>
): Promise<void> {
  const success = await deleteEquipment(
    request.body.equipmentNumber,
    request.session.user as User
  )

  const equipment = await getEquipmentList()

  response.json({
    equipment,
    success
  } satisfies DoDeleteEquipmentResponse)
}
