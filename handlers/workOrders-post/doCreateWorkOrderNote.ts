import type { Request, Response } from 'express'

import createWorkOrderNote, {
  type CreateWorkOrderNoteForm
} from '../../database/workOrders/createWorkOrderNote.js'

export type DoCreateWorkOrderNoteResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      noteSequence: number
    }

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderNoteForm>,
  response: Response<DoCreateWorkOrderNoteResponse>
): Promise<void> {
  const noteSequence = await createWorkOrderNote(
    request.body,
    request.session.user?.userName ?? ''
  )

  if (noteSequence === undefined) {
    response.json({
      success: false,
      errorMessage: 'Work order not found.'
    })
    return
  }

  response.json({
    success: true,
    noteSequence
  })
}
