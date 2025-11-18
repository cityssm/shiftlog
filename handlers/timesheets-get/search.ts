import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getTimesheetTypeDataListItems from '../../database/timesheets/getTimesheetTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const supervisors = await getEmployees({ isSupervisor: true })

  const timesheetTypes = await getTimesheetTypeDataListItems(request.session.user)

  response.render('timesheets/search', {
    headTitle: `${getConfigProperty('timesheets.sectionNameSingular')} Search`,

    supervisors,
    timesheetTypes
  })
}
