import type { Request, Response } from 'express'

import updateShift, {
  type UpdateShiftForm
} from '../../database/shifts/updateShift.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateShiftResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateShiftForm>,
  response: Response<DoUpdateShiftResponse>
): Promise<void> {
  const success = await updateShift(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
