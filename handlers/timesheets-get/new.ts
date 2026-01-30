import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getShift from '../../database/shifts/getShift.js'
import getTimesheetTypeDataListItems from '../../database/timesheets/getTimesheetTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Shift } from '../../types/record.types.js'

import type { TimesheetEditResponse } from './types.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    unknown,
    { error?: string; shiftId?: string }
  >,
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

  // Get shift data if shiftId is provided
  let shift: Shift | undefined
  let timesheetDate = new Date()
  let supervisorEmployeeNumber = ''

  if (request.query.shiftId !== undefined && request.query.shiftId !== '') {
    shift = await getShift(request.query.shiftId, request.session.user)
    if (shift !== undefined) {
      timesheetDate = shift.shiftDate as Date
      supervisorEmployeeNumber = shift.supervisorEmployeeNumber
    }
  }

  response.render('timesheets/edit', {
    headTitle: `Create New ${getConfigProperty('timesheets.sectionNameSingular')}`,
    section: 'timesheets',

    isCreate: true,
    isEdit: true,

    timesheet: {
      timesheetId: -1,
      timesheetDate,
      timesheetTypeDataListItemId:
        timesheetTypes.length === 1 ? timesheetTypes[0].dataListItemId : -1,
      supervisorEmployeeNumber,
      timesheetTitle: '',
      timesheetNote: '',
      shiftId: shift?.shiftId
    },

    supervisors,
    timesheetTypes
  } satisfies TimesheetEditResponse)
}
