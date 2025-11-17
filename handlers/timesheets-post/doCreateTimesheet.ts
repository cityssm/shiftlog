import type { Request, Response } from 'express'

import type { CreateTimesheetForm } from '../../database/timesheets/createTimesheet.js'
import createTimesheet from '../../database/timesheets/createTimesheet.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, CreateTimesheetForm>,
  response: Response
): Promise<void> {
  const timesheetId = await createTimesheet(
    request.body,
    request.session.user?.userName ?? ''
  )

  const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')
  const router = getConfigProperty('timesheets.router')

  response.json({
    success: true,
    timesheetId,
    redirectURL: `${urlPrefix}/${router}/${timesheetId}/edit`
  })
}
