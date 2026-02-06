import type { Request, Response } from 'express'

import createShiftNote, {
  type CreateShiftNoteForm
} from '../../database/shifts/createShiftNote.js'

export type DoCreateShiftNoteResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      noteSequence: number
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
      success: false,
      errorMessage: 'Shift not found.'
    })
    return
  }

  response.json({
    success: true,
    noteSequence
  })
}
