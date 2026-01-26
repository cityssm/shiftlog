import type { Request, Response } from 'express'

import type { UpdateTimesheetCellForm } from '../../database/timesheets/updateTimesheetCell.js'
import updateTimesheetCell from '../../database/timesheets/updateTimesheetCell.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateTimesheetCellResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetCellForm>,
  response: Response<DoUpdateTimesheetCellResponse>
): Promise<void> {
  const success = await updateTimesheetCell(request.body)

  response.json({
    success
  } satisfies DoUpdateTimesheetCellResponse)
}
