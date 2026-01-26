import type { Request, Response } from 'express'

import deleteWorkOrderNote from '../../database/workOrders/deleteWorkOrderNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderNoteResponse = {
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: number | string; noteSequence: number | string }
  >,
  response: Response<DoDeleteWorkOrderNoteResponse>
): Promise<void> {
  const success = await deleteWorkOrderNote(
    request.body.workOrderId,
    request.body.noteSequence,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
