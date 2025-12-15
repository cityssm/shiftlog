import type { Request, Response } from 'express'

import deleteCrew from '../../database/crews/deleteCrew.js'
import getCrews from '../../database/crews/getCrews.js'

export default async function handler(
  request: Request<unknown, unknown, { crewId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteCrew(
    Number.parseInt(request.body.crewId, 10),
    request.session.user as User
  )

  const crews = await getCrews()

  response.json({
    success,
    crews
  })
}
