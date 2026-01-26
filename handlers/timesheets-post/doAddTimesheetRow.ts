import type { Request, Response } from 'express'

import type { AddTimesheetRowForm } from '../../database/timesheets/addTimesheetRow.js'
import addTimesheetRow from '../../database/timesheets/addTimesheetRow.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddTimesheetRowResponse = {
  success: true
  timesheetRowId: number
}

export default async function handler(
  request: Request<unknown, unknown, AddTimesheetRowForm>,
  response: Response<DoAddTimesheetRowResponse>
): Promise<void> {
  const timesheetRowId = await addTimesheetRow(request.body)

  response.json({
    success: true,
    timesheetRowId
  })
}
