import type { Request, Response } from 'express'

import deleteShiftNote from '../../database/shifts/deleteShiftNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteShiftNoteResponse = {
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { shiftId: number | string; noteSequence: number | string }
  >,
  response: Response<DoDeleteShiftNoteResponse>
): Promise<void> {
  const success = await deleteShiftNote(
    request.body.shiftId,
    request.body.noteSequence,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
