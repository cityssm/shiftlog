import type { Request, Response } from 'express'

import getWorkOrderNotes from '../../database/workOrders/getWorkOrderNotes.js'

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response
): Promise<void> {
  const notes = await getWorkOrderNotes(request.params.workOrderId)

  response.json({
    success: true,
    notes
  })
}
