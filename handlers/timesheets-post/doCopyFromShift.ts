import type { Request, Response } from 'express'

import copyFromShift from '../../database/timesheets/copyFromShift.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCopyFromShiftResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string, timesheetId: number | string }>,
  response: Response<DoCopyFromShiftResponse>
): Promise<void> {
  const success = await copyFromShift(
    request.body.shiftId,
    request.body.timesheetId
  )

  response.json({
    success
  } satisfies DoCopyFromShiftResponse)
}
