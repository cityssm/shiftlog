import type { Request, Response } from 'express'

import updateShiftAdhocTaskNote from '../../database/adhocTasks/updateShiftAdhocTaskNote.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      shiftId: number | string
      adhocTaskId: number | string
      shiftAdhocTaskNote: string
    }
  >,
  response: Response
): Promise<void> {
  const success = await updateShiftAdhocTaskNote(
    request.body.shiftId,
    request.body.adhocTaskId,
    request.body.shiftAdhocTaskNote
  )

  response.json({
    success,
    errorMessage: success ? undefined : 'Failed to update task note.'
  })
}
