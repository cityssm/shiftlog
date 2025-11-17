import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getShifts from '../../database/shifts/getShifts.js'
import getTimesheets from '../../database/timesheets/getTimesheets.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const todayString = dateToString(new Date())

  const shiftsResult =
    getConfigProperty('shifts.isEnabled') &&
    request.session.user?.userProperties.shifts.canView
      ? await getShifts(
          { shiftDateString: todayString },
          { limit: -1, offset: 0 },
          request.session.user
        )
      : { shifts: [], totalCount: 0 }

  const timesheetsResult =
    getConfigProperty('timesheets.isEnabled') &&
    request.session.user?.userProperties.timesheets.canView
      ? await getTimesheets(
          { timesheetDateString: todayString },
          { limit: -1, offset: 0 },
          request.session.user
        )
      : { timesheets: [], totalCount: 0 }

  response.render('dashboard/dashboard', {
    headTitle: 'Dashboard',

    shifts: shiftsResult.shifts,
    timesheets: timesheetsResult.timesheets
  })
}
