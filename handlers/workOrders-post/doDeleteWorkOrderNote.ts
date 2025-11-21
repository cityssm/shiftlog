import type { Request, Response } from 'express'

import deleteWorkOrderNote from '../../database/workOrders/deleteWorkOrderNote.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: number | string; noteSequence: number | string }
  >,
  response: Response
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
