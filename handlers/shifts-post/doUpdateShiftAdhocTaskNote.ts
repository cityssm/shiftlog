import type { Request, Response } from 'express'

import updateShiftAdhocTaskNote from '../../database/adhocTasks/updateShiftAdhocTaskNote.js'

export type DoUpdateShiftAdhocTaskNoteResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
    }

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
  response: Response<DoUpdateShiftAdhocTaskNoteResponse>
): Promise<void> {
  const success = await updateShiftAdhocTaskNote(
    request.body.shiftId,
    request.body.adhocTaskId,
    request.body.shiftAdhocTaskNote
  )

  if (success) {
    response.json({
      success: true
    })

    return
  }

  response.json({
    success: false,

    errorMessage: 'Failed to update task note.'
  })
}
