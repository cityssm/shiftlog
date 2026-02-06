import type { Request, Response } from 'express'

import getShiftNotes from '../../database/shifts/getShiftNotes.js'
import type { ShiftNote } from '../../database/shifts/getShiftNotes.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftNotesResponse = {
  notes: ShiftNote[]
  success: true
}

export default async function handler(
  request: Request<{ shiftId: string }>,
  response: Response<DoGetShiftNotesResponse>
): Promise<void> {
  const notes = await getShiftNotes(request.params.shiftId)

  response.json({
    notes,
    success: true
  })
}
