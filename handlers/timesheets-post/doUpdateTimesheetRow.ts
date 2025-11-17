import type { Request, Response } from 'express'

import type { UpdateTimesheetRowForm } from '../../database/timesheets/updateTimesheetRow.js'
import updateTimesheetRow from '../../database/timesheets/updateTimesheetRow.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetRowForm>,
  response: Response
): Promise<void> {
  const success = await updateTimesheetRow(request.body)

  response.json({
    success
  })
}
