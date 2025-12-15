import type { Request, Response } from 'express'

import getCrews from '../../database/crews/getCrews.js'
import updateCrew from '../../database/crews/updateCrew.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewId: string
      crewName: string
      userGroupId: string
    }
  >,
  response: Response
): Promise<void> {
  const success = await updateCrew(
    {
      crewId: Number.parseInt(request.body.crewId, 10),
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
    success,
    crews
  })
}
