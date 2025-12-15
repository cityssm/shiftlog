import type { Request, Response } from 'express'

import addCrewMember from '../../database/crews/addCrewMember.js'
import getCrew from '../../database/crews/getCrew.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewId: string
      employeeNumber: string
    }
  >,
  response: Response
): Promise<void> {
  const crewId = Number.parseInt(request.body.crewId, 10)
  const success = await addCrewMember(crewId, request.body.employeeNumber)

  const crew = await getCrew(crewId)

  response.json({
    success,
    crew
  })
}
