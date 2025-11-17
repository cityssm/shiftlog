import type { Request, Response } from 'express'

import addShiftCrew from '../../database/shifts/addShiftCrew.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await addShiftCrew(request.body, request.session.user as User)

  response.json({
    success
  })
}
