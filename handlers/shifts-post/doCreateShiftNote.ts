import type { Request, Response } from 'express'

import createShiftNote, {
  type CreateShiftNoteForm
} from '../../database/shifts/createShiftNote.js'

export type DoCreateShiftNoteResponse =
  | {
      errorMessage: string
      success: false
    }
  | {
      noteSequence: number
      success: true
    }

export default async function handler(
  request: Request<unknown, unknown, CreateShiftNoteForm>,
  response: Response<DoCreateShiftNoteResponse>
): Promise<void> {
  const noteSequence = await createShiftNote(
    request.body,
    request.session.user?.userName ?? ''
  )

  if (noteSequence === undefined) {
    response.json({
      errorMessage: 'Shift not found.',
      success: false
    })
    return
  }

  response.json({
    noteSequence,
    success: true
  })
}
