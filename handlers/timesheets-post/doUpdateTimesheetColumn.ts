import type { Request, Response } from 'express'

import type { UpdateTimesheetColumnForm } from '../../database/timesheets/updateTimesheetColumn.js'
import updateTimesheetColumn from '../../database/timesheets/updateTimesheetColumn.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateTimesheetColumnResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetColumnForm>,
  response: Response<DoUpdateTimesheetColumnResponse>
): Promise<void> {
  const success = await updateTimesheetColumn(request.body)

  response.json({
    success
  } satisfies DoUpdateTimesheetColumnResponse)
}
