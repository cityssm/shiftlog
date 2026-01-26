import type { Request, Response } from 'express'

import addShiftCrew from '../../database/shifts/addShiftCrew.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddShiftCrewResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoAddShiftCrewResponse>
): Promise<void> {
  const success = await addShiftCrew(request.body, request.session.user as User)

  response.json({
    success
  })
}
