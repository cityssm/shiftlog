import type { Request, Response } from 'express'

import markEmployeesAsEntered from '../../database/timesheets/markEmployeesAsEntered.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoMarkEmployeesAsEnteredResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response<DoMarkEmployeesAsEnteredResponse>
): Promise<void> {
  const success = await markEmployeesAsEntered(
    request.body.timesheetId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  } satisfies DoMarkEmployeesAsEnteredResponse)
}
