import type { Request, Response } from 'express'

import getTimesheetsByShift from '../../database/timesheets/getTimesheetsByShift.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response
): Promise<void> {
  const timesheets = await getTimesheetsByShift(
    request.body.shiftId,
    request.session.user
  )

  response.json({
    success: true,
    timesheets
  })
}
