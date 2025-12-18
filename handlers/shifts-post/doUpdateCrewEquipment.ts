import type { Request, Response } from 'express'

import getCrew from '../../database/crews/getCrew.js'
import updateCrewEquipment from '../../database/crews/updateCrewEquipment.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      crewId: string
      equipmentNumber: string
      employeeNumber: string
    }
  >,
  response: Response
): Promise<void> {
  const user = request.session.user as User
  const crewId = Number.parseInt(request.body.crewId, 10)

  // Check permissions
  const crew = await getCrew(crewId)
  if (crew === undefined) {
    response.status(404).json({
      success: false,
      message: 'Crew not found.'
    })
    return
  }

  if (
    !user.userProperties.shifts.canManage &&
    crew.recordCreate_userName !== user.userName
  ) {
    response.status(403).json({
      success: false,
      message: 'You do not have permission to modify this crew.'
    })
    return
  }

  const employeeNumber =
    request.body.employeeNumber === '' ? undefined : request.body.employeeNumber

  const success = await updateCrewEquipment(
    crewId,
    request.body.equipmentNumber,
    employeeNumber
  )

  const updatedCrew = await getCrew(crewId)

  response.json({
    success,
    crew: updatedCrew
  })
}
