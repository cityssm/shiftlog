import type { Request, Response } from 'express'

import type { UpdateTimesheetColumnForm } from '../../database/timesheets/updateTimesheetColumn.js'
import updateTimesheetColumn from '../../database/timesheets/updateTimesheetColumn.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetColumnForm>,
  response: Response
): Promise<void> {
  const success = await updateTimesheetColumn(request.body)

  response.json({
    success
  })
}
