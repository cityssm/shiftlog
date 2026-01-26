import type { Request, Response } from 'express'

import updateShiftCrewNote from '../../database/shifts/updateShiftCrewNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftCrewNoteResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoUpdateShiftCrewNoteResponse>
): Promise<void> {
  const success = await updateShiftCrewNote(request.body)

  response.json({
    success
  })
}
