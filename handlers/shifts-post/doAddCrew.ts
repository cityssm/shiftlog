import type { Request, Response } from 'express'

import addCrew from '../../database/crews/addCrew.js'
import getCrews from '../../database/crews/getCrews.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewName: string
      userGroupId: string
    }
  >,
  response: Response
): Promise<void> {
  const crewId = await addCrew(
    {
      crewName: request.body.crewName,
      userGroupId:
        request.body.userGroupId === ''
          ? undefined
          : Number.parseInt(request.body.userGroupId, 10)
    },
    request.session.user as User
  )

  const crews = await getCrews()

  response.json({
    crewId,
    crews,
    success: crewId !== undefined
  })
}
