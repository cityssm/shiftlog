import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getShiftTimeDataListItems from '../../database/shifts/getShiftTimeDataListItems.js'
import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const supervisors = await getEmployees({ isSupervisor: true })

  const shiftTypes = await getShiftTypeDataListItems(request.session.user)

  const shiftTimes = await getShiftTimeDataListItems(request.session.user)

  response.render('shifts/search', {
    headTitle: `${getConfigProperty('shifts.sectionNameSingular')} - Search`,

    shiftTimes,
    shiftTypes,
    supervisors
  })
}
