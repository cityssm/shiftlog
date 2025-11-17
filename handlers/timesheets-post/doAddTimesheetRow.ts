import type { Request, Response } from 'express'

import type { AddTimesheetRowForm } from '../../database/timesheets/addTimesheetRow.js'
import addTimesheetRow from '../../database/timesheets/addTimesheetRow.js'

export default async function handler(
  request: Request<unknown, unknown, AddTimesheetRowForm>,
  response: Response
): Promise<void> {
  const timesheetRowId = await addTimesheetRow(request.body)

  response.json({
    success: true,
    timesheetRowId
  })
}
