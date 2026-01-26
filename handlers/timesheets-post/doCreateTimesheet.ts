import type { Request, Response } from 'express'

import copyFromShift from '../../database/timesheets/copyFromShift.js'
import type { CreateTimesheetForm } from '../../database/timesheets/createTimesheet.js'
import createTimesheet from '../../database/timesheets/createTimesheet.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoCreateTimesheetResponse = {
  success: true
  timesheetId: number
  redirectURL: string
}

export default async function handler(
  request: Request<unknown, unknown, CreateTimesheetForm>,
  response: Response<DoCreateTimesheetResponse>
): Promise<void> {
  const timesheetId = await createTimesheet(
    request.body,
    request.session.user?.userName ?? ''
  )

  // If shiftId is provided, automatically copy data from shift
  if (
    request.body.shiftId !== undefined &&
    request.body.shiftId !== null &&
    request.body.shiftId !== ''
  ) {
    await copyFromShift(request.body.shiftId, timesheetId)
  }

  const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')
  const router = getConfigProperty('timesheets.router')

  response.json({
    success: true,
    timesheetId,
    redirectURL: `${urlPrefix}/${router}/${timesheetId}/edit`
  })
}
