import type { Request, Response } from 'express'

import deleteTimesheetRow from '../../database/timesheets/deleteTimesheetRow.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetRowId: number | string }>,
  response: Response
): Promise<void> {
  const success = await deleteTimesheetRow(request.body.timesheetRowId)

  response.json({
    success
  })
}
