import type { Request, Response } from 'express'

import updateShiftEmployeeNote from '../../database/shifts/updateShiftEmployeeNote.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateShiftEmployeeNote(request.body)

  response.json({
    success
  })
}
