import type { Request, Response } from 'express'

import deleteCrewEquipment from '../../database/crews/deleteCrewEquipment.js'
import getCrew from '../../database/crews/getCrew.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewId: string
      equipmentNumber: string
    }
  >,
  response: Response
): Promise<void> {
  const crewId = Number.parseInt(request.body.crewId, 10)
  const success = await deleteCrewEquipment(
    crewId,
    request.body.equipmentNumber
  )

  const crew = await getCrew(crewId)

  response.json({
    success,
    crew
  })
}
