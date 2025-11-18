import type { Request, Response } from 'express'

import type { UpdateTimesheetCellForm } from '../../database/timesheets/updateTimesheetCell.js'
import updateTimesheetCell from '../../database/timesheets/updateTimesheetCell.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetCellForm>,
  response: Response
): Promise<void> {
  const success = await updateTimesheetCell(request.body)

  response.json({
    success
  })
}
