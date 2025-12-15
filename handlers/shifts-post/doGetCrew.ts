import type { Request, Response } from 'express'

import getCrew from '../../database/crews/getCrew.js'

export default async function handler(
  request: Request<unknown, unknown, { crewId: string }>,
  response: Response
): Promise<void> {
  const crew = await getCrew(Number.parseInt(request.body.crewId, 10))

  response.json({
    success: crew !== undefined,
    crew
  })
}
