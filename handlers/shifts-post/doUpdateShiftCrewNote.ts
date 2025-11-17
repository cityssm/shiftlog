import type { Request, Response } from 'express'

import updateShiftCrewNote from '../../database/shifts/updateShiftCrewNote.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateShiftCrewNote(request.body)

  response.json({
    success
  })
}
