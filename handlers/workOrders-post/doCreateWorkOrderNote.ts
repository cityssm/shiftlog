import type { Request, Response } from 'express'

import createWorkOrderNote, {
  type CreateWorkOrderNoteForm
} from '../../database/workOrders/createWorkOrderNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCreateWorkOrderNoteResponse = {
  success: boolean
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

  response.json({
    success: true,
    noteSequence
  })
}
