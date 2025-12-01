import type { Request, Response } from 'express'

import getDeletedShifts from '../../database/shifts/getDeletedShifts.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const shifts = await getDeletedShifts(request.session.user)

  response.json({
    success: true,
    shifts
  })
}
