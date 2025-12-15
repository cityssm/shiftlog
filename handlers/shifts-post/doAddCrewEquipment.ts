import type { Request, Response } from 'express'

import addCrewEquipment from '../../database/crews/addCrewEquipment.js'
import getCrew from '../../database/crews/getCrew.js'

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

  const success = await addCrewEquipment(
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
