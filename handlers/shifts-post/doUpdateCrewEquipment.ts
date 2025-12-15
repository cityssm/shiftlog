import type { Request, Response } from 'express'

import getCrew from '../../database/crews/getCrew.js'
import updateCrewEquipment from '../../database/crews/updateCrewEquipment.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewId: string
      equipmentNumber: string
      employeeNumber: string
    }
  >,
  response: Response
): Promise<void> {
  const crewId = Number.parseInt(request.body.crewId, 10)
  const employeeNumber =
    request.body.employeeNumber === '' ? undefined : request.body.employeeNumber

  const success = await updateCrewEquipment(
    crewId,
    request.body.equipmentNumber,
    employeeNumber
  )

  const crew = await getCrew(crewId)

  response.json({
    success,
    crew
  })
}
