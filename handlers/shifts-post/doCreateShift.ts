import type { Request, Response } from 'express'

import createShift, {
  type CreateShiftForm
} from '../../database/shifts/createShift.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCreateShiftResponse = {
  success: boolean
  shiftId: number
}

export default async function handler(
  request: Request<unknown, unknown, CreateShiftForm>,
  response: Response<DoCreateShiftResponse>
): Promise<void> {
  const shiftId = await createShift(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success: true,

    shiftId
  } satisfies DoCreateShiftResponse)
}
