import type { Request, Response } from 'express'

import addCrewMember from '../../database/crews/addCrewMember.js'
import getCrew from '../../database/crews/getCrew.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddCrewMemberResponse = {
  success: boolean
  message?: string
  crew?: Crew
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewId: string
      employeeNumber: string
    }
  >,
  response: Response<DoAddCrewMemberResponse>
): Promise<void> {
  const user = request.session.user as User
  const crewId = Number.parseInt(request.body.crewId, 10)

  // Check permissions
  const crew = await getCrew(crewId)
  if (crew === undefined) {
    response.status(404).json({
      success: false,
      message: 'Crew not found.'
    } satisfies DoAddCrewMemberResponse)
    return
  }

  if (
    !user.userProperties.shifts.canManage &&
    crew.recordCreate_userName !== user.userName
  ) {
    response.status(403).json({
      success: false,
      message: 'You do not have permission to modify this crew.'
    } satisfies DoAddCrewMemberResponse)
    return
  }

  const success = await addCrewMember(crewId, request.body.employeeNumber)

  const updatedCrew = await getCrew(crewId)

  response.json({
    success,
    crew: updatedCrew
  } satisfies DoAddCrewMemberResponse)
}
