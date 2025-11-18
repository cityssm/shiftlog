import type { Request, Response } from 'express'

import deleteTimesheetColumn from '../../database/timesheets/deleteTimesheetColumn.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetColumnId: number | string }>,
  response: Response
): Promise<void> {
  const success = await deleteTimesheetColumn(request.body.timesheetColumnId)

  response.json({
    success
  })
}
