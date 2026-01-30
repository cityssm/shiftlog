import type { Request, Response } from 'express'

import getTimesheet from '../../database/timesheets/getTimesheet.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import type { TimesheetEditResponse } from './types.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('timesheets.router')}`

export default async function handler(
  request: Request<{ timesheetId: string }, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const timesheet = await getTimesheet(request.params.timesheetId, request.session.user)

  if (timesheet === undefined) {
    response.redirect(`${redirectRoot}/?error=notFound`)
    return
  }

  response.render('timesheets/edit', {
    headTitle: `${getConfigProperty('timesheets.sectionNameSingular')} #${
      request.params.timesheetId
    }`,
    section: 'timesheets',

    isCreate: false,
    isEdit: false,

    timesheet,

    timesheetTypes: [],
    supervisors: []
  } satisfies TimesheetEditResponse)
}
