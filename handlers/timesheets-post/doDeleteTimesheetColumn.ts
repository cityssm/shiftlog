import type { Request, Response } from 'express'

import deleteTimesheetColumn from '../../database/timesheets/deleteTimesheetColumn.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteTimesheetColumnResponse = {
  success: boolean
  totalHours?: number
}

export default async function handler(
  request: Request<unknown, unknown, { timesheetColumnId: number | string }>,
  response: Response<DoDeleteTimesheetColumnResponse>
): Promise<void> {
  const result = await deleteTimesheetColumn(request.body.timesheetColumnId)

  response.json(result satisfies DoDeleteTimesheetColumnResponse)
}
