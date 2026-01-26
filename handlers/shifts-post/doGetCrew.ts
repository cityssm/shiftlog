import type { Request, Response } from 'express'

import getCrew from '../../database/crews/getCrew.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetCrewResponse = {
  success: boolean
  crew?: Awaited<ReturnType<typeof getCrew>>
}

export default async function handler(
  request: Request<unknown, unknown, { crewId: string }>,
  response: Response<DoGetCrewResponse>
): Promise<void> {
  const crew = await getCrew(Number.parseInt(request.body.crewId, 10))

  response.json({
    success: crew !== undefined,
    crew
  } satisfies DoGetCrewResponse)
}
