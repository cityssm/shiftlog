import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getShifts from '../../database/shifts/getShifts.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const todayString = dateToString(new Date())

  const shifts =
    getConfigProperty('shifts.isEnabled') &&
    request.session.user?.userProperties.shifts.canView
      ? await getShifts({ shiftDateString: todayString }, request.session.user)
      : []

  response.render('dashboard/dashboard', {
    headTitle: 'Dashboard',

    shifts
  })
}
