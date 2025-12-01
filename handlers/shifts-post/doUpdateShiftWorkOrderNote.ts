import type { Request, Response } from 'express'

import updateShiftWorkOrderNote from '../../database/shifts/updateShiftWorkOrderNote.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      shiftId: number | string
      workOrderId: number | string
      shiftWorkOrderNote: string
    }
  >,
  response: Response
): Promise<void> {
  const success = await updateShiftWorkOrderNote(
    request.body.shiftId,
    request.body.workOrderId,
    request.body.shiftWorkOrderNote
  )

  response.json({
    success,
    errorMessage: success ? undefined : 'Failed to update note.'
  })
}
