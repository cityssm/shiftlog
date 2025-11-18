import type { Request, Response } from 'express'

import type { ReorderTimesheetColumnsForm } from '../../database/timesheets/reorderTimesheetColumns.js'
import reorderTimesheetColumns from '../../database/timesheets/reorderTimesheetColumns.js'

export default async function handler(
  request: Request<unknown, unknown, ReorderTimesheetColumnsForm>,
  response: Response
): Promise<void> {
  const success = await reorderTimesheetColumns(request.body)

  response.json({
    success
  })
}
