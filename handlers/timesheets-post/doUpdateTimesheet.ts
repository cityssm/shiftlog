import type { Request, Response } from 'express'

import type { UpdateTimesheetForm } from '../../database/timesheets/updateTimesheet.js'
import updateTimesheet from '../../database/timesheets/updateTimesheet.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetForm>,
  response: Response
): Promise<void> {
  const success = await updateTimesheet(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
