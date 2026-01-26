import type { Request, Response } from 'express'

import getWorkOrderNotes from '../../database/workOrders/getWorkOrderNotes.js'
import type { WorkOrderNote } from '../../database/workOrders/getWorkOrderNotes.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetWorkOrderNotesResponse = {
  success: MediaTrackSupportedConstraints
  notes: WorkOrderNote[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetWorkOrderNotesResponse>
): Promise<void> {
  const notes = await getWorkOrderNotes(request.params.workOrderId)

  response.json({
    success: true,
    notes
  })
}
