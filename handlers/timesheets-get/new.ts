import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getTimesheetTypeDataListItems from '../../database/timesheets/getTimesheetTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import type { TimesheetEditResponse } from './types.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
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
    headTitle: `Create New ${getConfigProperty('timesheets.sectionNameSingular')}`,

    isCreate: true,
    isEdit: true,

    timesheet: {
      timesheetId: -1,
      timesheetDate: new Date(),
      timesheetTypeDataListItemId:
        timesheetTypes.length === 1 ? timesheetTypes[0].dataListItemId : -1,
      supervisorEmployeeNumber: '',
      timesheetTitle: '',
      timesheetNote: ''
    },

    supervisors,
    timesheetTypes
  } satisfies TimesheetEditResponse)
}
