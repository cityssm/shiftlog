import type { Request, Response } from 'express'

import updateShiftEmployeeNote from '../../database/shifts/updateShiftEmployeeNote.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftEmployeeNoteResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoUpdateShiftEmployeeNoteResponse>
): Promise<void> {
  const success = await updateShiftEmployeeNote(request.body)

  response.json({
    success
  })
}
