import type { Request, Response } from 'express'

import deleteCrew from '../../database/crews/deleteCrew.js'
import getCrew from '../../database/crews/getCrew.js'
import getCrews from '../../database/crews/getCrews.js'

export default async function handler(
  request: Request<unknown, unknown, { crewId: string }>,
  response: Response
): Promise<void> {
  const user = request.session.user as User
  const crewId = Number.parseInt(request.body.crewId, 10)

  // Check permissions
  if (!user.userProperties.shifts.canManage) {
    const crew = await getCrew(crewId)
    if (crew === undefined || crew.recordCreate_userName !== user.userName) {
      response.status(403).json({
        success: false,
        message: 'You do not have permission to delete this crew.'
      })
      return
    }
  }

  const success = await deleteCrew(crewId, user)

  const crews = await getCrews()

  response.json({
    success,
    crews
  })
}
