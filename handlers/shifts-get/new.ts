import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getShiftTimeDataListItems from '../../database/shifts/getShiftTimeDataListItems.js'
import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Shift } from '../../types/record.types.js'

import type { ShiftEditResponse } from './types.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
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

  const shift = {
    shiftDate: new Date(),
    shiftTimeDataListItemId: -1,
    shiftTypeDataListItemId: -1,
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

    shiftTimes,
    shiftTypes,
    supervisors
  } satisfies ShiftEditResponse)
}
