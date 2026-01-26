import type { Request, Response } from 'express'

import getCrew from '../../database/crews/getCrew.js'
import getCrews from '../../database/crews/getCrews.js'
import updateCrew from '../../database/crews/updateCrew.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateCrewResponse = {
  success: boolean
  message?: string
  crews?: Crew[]
}

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
  response: Response<DoUpdateCrewResponse>
): Promise<void> {
  const user = request.session.user as User
  const crewId = Number.parseInt(request.body.crewId, 10)

  // Check permissions
  if (!user.userProperties.shifts.canManage) {
    const crew = await getCrew(crewId)
    if (crew === undefined || crew.recordCreate_userName !== user.userName) {
      response.status(403).json({
        success: false,
        message: 'You do not have permission to update this crew.'
      } satisfies DoUpdateCrewResponse)
      return
    }
  }

  const success = await updateCrew(
    {
      crewId,
      crewName: request.body.crewName,
      userGroupId:
        request.body.userGroupId === ''
          ? undefined
          : Number.parseInt(request.body.userGroupId, 10)
    },
    user
  )

  const crews = await getCrews()

  response.json({
    success,
    crews
  } satisfies DoUpdateCrewResponse)
}
