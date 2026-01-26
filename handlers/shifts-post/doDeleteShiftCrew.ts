import type { Request, Response } from 'express'

import deleteShiftCrew from '../../database/shifts/deleteShiftCrew.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteShiftCrewResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoDeleteShiftCrewResponse>
): Promise<void> {
  const success = await deleteShiftCrew(request.body)

  response.json({
    success
  })
}
