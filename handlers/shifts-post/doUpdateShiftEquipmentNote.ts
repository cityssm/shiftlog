import type { Request, Response } from 'express'

import updateShiftEquipmentNote from '../../database/shifts/updateShiftEquipmentNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftEquipmentNoteResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoUpdateShiftEquipmentNoteResponse>
): Promise<void> {
  const success = await updateShiftEquipmentNote(request.body)

  response.json({
    success
  } satisfies DoUpdateShiftEquipmentNoteResponse)
}
