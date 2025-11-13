import type { Request, Response } from 'express'

import deleteEquipment from '../../database/equipment/deleteEquipment.js'
import getEquipment from '../../database/equipment/getEquipment.js'

export default async function handler(
  request: Request<unknown, unknown, { equipmentNumber: string }>,
  response: Response
): Promise<void> {
  const success = await deleteEquipment(
    request.body.equipmentNumber,
    request.session.user as User
  )

  const equipment = await getEquipment()

  response.json({
    equipment,
    success
  })
}
