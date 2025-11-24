import type { Request, Response } from 'express'

import updateWorkOrderNote, {
  type UpdateWorkOrderNoteForm
} from '../../database/workOrders/updateWorkOrderNote.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderNoteForm>,
  response: Response
): Promise<void> {
  const success = await updateWorkOrderNote(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
