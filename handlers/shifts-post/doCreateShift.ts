import type { Request, Response } from 'express'

import createShift, {
  type CreateShiftForm
} from '../../database/shifts/createShift.js'

export default async function handler(
  request: Request<unknown, unknown, CreateShiftForm>,
  response: Response
): Promise<void> {
  const shiftId = await createShift(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success: true,

    shiftId
  })
}
