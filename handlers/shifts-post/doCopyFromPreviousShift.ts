import type { Request, Response } from 'express'

import copyFromPreviousShift from '../../database/shifts/copyFromPreviousShift.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCopyFromPreviousShiftResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoCopyFromPreviousShiftResponse>
): Promise<void> {
  const success = await copyFromPreviousShift(
    request.body,
    request.session.user as User
  )

  response.json({
    success
  })
}
