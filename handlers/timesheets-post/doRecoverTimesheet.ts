import type { Request, Response } from 'express'

import recoverTimesheet from '../../database/timesheets/recoverTimesheet.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('timesheets.router')}`

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response
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
    })
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to recover timesheet.'
    })
  }
}
