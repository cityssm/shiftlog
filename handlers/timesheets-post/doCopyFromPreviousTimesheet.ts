import type { Request, Response } from 'express'

import copyFromPreviousTimesheet from '../../database/timesheets/copyFromPreviousTimesheet.js'

export default async function handler(
  request: Request<unknown, unknown, { sourceTimesheetId: number | string, targetTimesheetId: number | string }>,
  response: Response
): Promise<void> {
  const success = await copyFromPreviousTimesheet(
    request.body.sourceTimesheetId,
    request.body.targetTimesheetId
  )

  response.json({
    success
  })
}
