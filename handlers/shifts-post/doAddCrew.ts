import type { Request, Response } from 'express'

import addCrew from '../../database/crews/addCrew.js'
import getCrews from '../../database/crews/getCrews.js'
import type { Crew } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddCrewResponse = {
  success: boolean

  crewId?: number
  crews: Crew[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewName: string
      userGroupId: string
    }
  >,
  response: Response<DoAddCrewResponse>
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
