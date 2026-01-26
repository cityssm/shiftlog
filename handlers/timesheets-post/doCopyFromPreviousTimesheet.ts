import type { Request, Response } from 'express'

import copyFromPreviousTimesheet from '../../database/timesheets/copyFromPreviousTimesheet.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCopyFromPreviousTimesheetResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { sourceTimesheetId: number | string, targetTimesheetId: number | string }>,
  response: Response<DoCopyFromPreviousTimesheetResponse>
): Promise<void> {
  const success = await copyFromPreviousTimesheet(
    request.body.sourceTimesheetId,
    request.body.targetTimesheetId
  )

  response.json({
    success
  } satisfies DoCopyFromPreviousTimesheetResponse)
}
