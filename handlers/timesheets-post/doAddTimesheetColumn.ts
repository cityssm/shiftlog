import type { Request, Response } from 'express'

import type { AddTimesheetColumnForm } from '../../database/timesheets/addTimesheetColumn.js'
import addTimesheetColumn from '../../database/timesheets/addTimesheetColumn.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddTimesheetColumnResponse = {
  success: boolean
  timesheetColumnId: number
}

export default async function handler(
  request: Request<unknown, unknown, AddTimesheetColumnForm>,
  response: Response<DoAddTimesheetColumnResponse>
): Promise<void> {
  const timesheetColumnId = await addTimesheetColumn(request.body)

  response.json({
    success: true,
    timesheetColumnId
  } satisfies DoAddTimesheetColumnResponse)
}
