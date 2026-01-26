import type { Request, Response } from 'express'

import type { UpdateTimesheetForm } from '../../database/timesheets/updateTimesheet.js'
import updateTimesheet from '../../database/timesheets/updateTimesheet.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateTimesheetResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetForm>,
  response: Response<DoUpdateTimesheetResponse>
): Promise<void> {
  const success = await updateTimesheet(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  } satisfies DoUpdateTimesheetResponse)
}
