import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getShiftTimeDataListItems from '../../database/shifts/getShiftTimeDataListItems.js'
import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Shift } from '../../types/record.types.js'

import type { ShiftEditResponse } from './types.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string; date?: string }>,
  response: Response
): Promise<void> {
  let supervisors = await getEmployees({ isSupervisor: true })

  if (!(request.session.user?.userProperties.shifts.canManage ?? false)) {
    supervisors = supervisors.filter(
      (supervisor) => supervisor.userName === request.session.user?.userName
    )
  }

  const shiftTypes = await getShiftTypeDataListItems(request.session.user)

  const shiftTimes = await getShiftTimeDataListItems(request.session.user)

  // Use date from query parameter if provided, otherwise use today
  let shiftDate = new Date()
  if (request.query.date !== undefined && request.query.date !== '') {
    try {
      const parsedDate = new Date(request.query.date)
      if (!isNaN(parsedDate.getTime())) {
        shiftDate = parsedDate
      }
    } catch {
      // Use default date if parsing fails
    }
  }

  const shift = {
    shiftDate,
    shiftTimeDataListItemId: shiftTimes.length === 1 ? shiftTimes[0].dataListItemId : -1,
    shiftTypeDataListItemId: shiftTypes.length === 1 ? shiftTypes[0].dataListItemId : -1,
    supervisorEmployeeNumber: '',
    shiftDescription: ''
  } satisfies Partial<Shift>

  response.render('shifts/edit', {
    headTitle: `Create New ${getConfigProperty('shifts.sectionNameSingular')}`,

    isCreate: true,
    isEdit: true,

    shift,
    shiftCrews: [],
    shiftEmployees: [],
    shiftEquipment: [],
    shiftWorkOrders: [],
    shiftAdhocTasks: [],

    shiftTimes,
    shiftTypes,
    supervisors
  } satisfies ShiftEditResponse)
}
