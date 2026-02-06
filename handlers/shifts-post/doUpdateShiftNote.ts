import type { Request, Response } from 'express'

import updateShiftNote, {
  type UpdateShiftNoteForm
} from '../../database/shifts/updateShiftNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftNoteResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateShiftNoteForm>,
  response: Response<DoUpdateShiftNoteResponse>
): Promise<void> {
  const success = await updateShiftNote(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
