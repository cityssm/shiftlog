import type { Request, Response } from 'express'

import copyFromShift from '../../database/timesheets/copyFromShift.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string, timesheetId: number | string }>,
  response: Response
): Promise<void> {
  const success = await copyFromShift(
    request.body.shiftId,
    request.body.timesheetId
  )

  response.json({
    success
  })
}
