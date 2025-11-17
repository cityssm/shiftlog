import type { Request, Response } from 'express'

import updateShift, {
  type UpdateShiftForm
} from '../../database/shifts/updateShift.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateShiftForm>,
  response: Response
): Promise<void> {
  const success = await updateShift(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
