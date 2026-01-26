import type { Request, Response } from 'express'

import recoverTimesheet from '../../database/timesheets/recoverTimesheet.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('timesheets.router')}`

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoRecoverTimesheetResponse =
  | {
      success: true
      message: string
      redirectUrl: string
    }
  | {
      success: false
      errorMessage: string
    }

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response<DoRecoverTimesheetResponse>
): Promise<void> {
  const success = await recoverTimesheet(
    request.body.timesheetId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true,
      message: 'Timesheet recovered successfully.',
      redirectUrl: `${redirectRoot}/${request.body.timesheetId}`
    } satisfies DoRecoverTimesheetResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to recover timesheet.'
    } satisfies DoRecoverTimesheetResponse)
  }
}
