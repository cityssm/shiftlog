import type { Request, Response } from 'express'

import getTimesheetColumns from '../../database/timesheets/getTimesheetColumns.js'
import type { TimesheetColumn } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetTimesheetColumnsResponse = {
  columns: TimesheetColumn[]
}

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response<DoGetTimesheetColumnsResponse>
): Promise<void> {
  const columns = await getTimesheetColumns(request.body.timesheetId)

  response.json({
    columns
  } satisfies DoGetTimesheetColumnsResponse)
}
