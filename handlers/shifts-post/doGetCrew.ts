import type { Request, Response } from 'express'

import getCrew, { type CrewWithDetails } from '../../database/crews/getCrew.js'

export type DoGetCrewResponse =
  | {
      success: false
    }
  | {
      success: true
      crew: CrewWithDetails
    }

export default async function handler(
  request: Request<unknown, unknown, { crewId: string }>,
  response: Response<DoGetCrewResponse>
): Promise<void> {
  const crew = await getCrew(Number.parseInt(request.body.crewId, 10))

  if (crew === undefined) {
    response.json({
      success: false
    })

    return
  }
  response.json({
    success: true,

    crew
  })
}
