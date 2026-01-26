import type { Request, Response } from 'express'

import updateWorkOrderNote, {
  type UpdateWorkOrderNoteForm
} from '../../database/workOrders/updateWorkOrderNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderNoteResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderNoteForm>,
  response: Response<DoUpdateWorkOrderNoteResponse>
): Promise<void> {
  const success = await updateWorkOrderNote(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
