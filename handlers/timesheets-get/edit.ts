import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getTimesheet from '../../database/timesheets/getTimesheet.js'
import getTimesheetTypeDataListItems from '../../database/timesheets/getTimesheetTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import type { TimesheetEditResponse } from './types.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('timesheets.router')}`

export default async function handler(
  request: Request<
    { timesheetId: string },
    unknown,
    unknown,
    { error?: string }
  >,
  response: Response
): Promise<void> {
  const timesheet = await getTimesheet(
    request.params.timesheetId,
    request.session.user
  )

  if (timesheet === undefined) {
    response.redirect(`${redirectRoot}/?error=notFound`)
    return
  } else if (
    !(request.session.user?.userProperties.timesheets.canManage ?? false) &&
    timesheet.supervisorUserName !== request.session.user?.userName
  ) {
    response.redirect(
      `${redirectRoot}/${timesheet.timesheetId}/?error=forbidden`
    )
    return
  } else if (
    (timesheet.employeesEntered_dateTime !== null &&
      timesheet.employeesEntered_dateTime !== undefined) ||
    (timesheet.equipmentEntered_dateTime !== null &&
      timesheet.equipmentEntered_dateTime !== undefined)
  ) {
    response.redirect(`${redirectRoot}/${timesheet.timesheetId}/?error=locked`)
    return
  }

  let supervisors = await getEmployees({ isSupervisor: true })

  if (!(request.session.user?.userProperties.timesheets.canManage ?? false)) {
    supervisors = supervisors.filter(
      (supervisor) => supervisor.userName === request.session.user?.userName
    )
  }

  const timesheetTypes = await getTimesheetTypeDataListItems(
    request.session.user
  )

  response.render('timesheets/edit', {
    headTitle: `${getConfigProperty('timesheets.sectionNameSingular')} #${
      request.params.timesheetId
    }`,

    isCreate: false,
    isEdit: true,

    timesheet,

    timesheetTypes,
    supervisors
  } satisfies TimesheetEditResponse)
}
