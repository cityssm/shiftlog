import type { Request, Response } from 'express'

import markTimesheetAsSubmitted from '../../database/timesheets/markTimesheetAsSubmitted.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoMarkTimesheetAsSubmittedResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response<DoMarkTimesheetAsSubmittedResponse>
): Promise<void> {
  const success = await markTimesheetAsSubmitted(
    request.body.timesheetId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
