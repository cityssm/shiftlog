import type { Request, Response } from 'express'

import deleteCrewEquipment from '../../database/crews/deleteCrewEquipment.js'
import getCrew from '../../database/crews/getCrew.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteCrewEquipmentResponse = {
  success: boolean
  message?: string
  crew?: Awaited<ReturnType<typeof getCrew>>
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewId: string
      equipmentNumber: string
    }
  >,
  response: Response<DoDeleteCrewEquipmentResponse>
): Promise<void> {
  const user = request.session.user as User
  const crewId = Number.parseInt(request.body.crewId, 10)

  // Check permissions
  const crew = await getCrew(crewId)
  if (crew === undefined) {
    response.status(404).json({
      success: false,
      message: 'Crew not found.'
    } satisfies DoDeleteCrewEquipmentResponse)
    return
  }

  if (
    !user.userProperties.shifts.canManage &&
    crew.recordCreate_userName !== user.userName
  ) {
    response.status(403).json({
      success: false,
      message: 'You do not have permission to modify this crew.'
    } satisfies DoDeleteCrewEquipmentResponse)
    return
  }

  const success = await deleteCrewEquipment(
    crewId,
    request.body.equipmentNumber
  )

  const updatedCrew = await getCrew(crewId)

  response.json({
    success,
    crew: updatedCrew
  } satisfies DoDeleteCrewEquipmentResponse)
}
