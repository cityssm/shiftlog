import type { Request, Response } from 'express'

import createWorkOrderNote, {
  type CreateWorkOrderNoteForm
} from '../../database/workOrders/createWorkOrderNote.js'

export default async function handler(
  request: Request<unknown, unknown, CreateWorkOrderNoteForm>,
  response: Response
): Promise<void> {
  const noteSequence = await createWorkOrderNote(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success: true,
    noteSequence
  })
}
