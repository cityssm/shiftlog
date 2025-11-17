import type { Request, Response } from 'express'

import markTimesheetAsSubmitted from '../../database/timesheets/markTimesheetAsSubmitted.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response
): Promise<void> {
  const success = await markTimesheetAsSubmitted(
    request.body.timesheetId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
