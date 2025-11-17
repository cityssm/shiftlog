import type { Request, Response } from 'express'

import type { AddTimesheetColumnForm } from '../../database/timesheets/addTimesheetColumn.js'
import addTimesheetColumn from '../../database/timesheets/addTimesheetColumn.js'

export default async function handler(
  request: Request<unknown, unknown, AddTimesheetColumnForm>,
  response: Response
): Promise<void> {
  const timesheetColumnId = await addTimesheetColumn(request.body)

  response.json({
    success: true,
    timesheetColumnId
  })
}
