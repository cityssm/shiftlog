import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getShift from '../../database/shifts/getShift.js'
import getShiftTimeDataListItems from '../../database/shifts/getShiftTimeDataListItems.js'
import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import type { ShiftEditResponse } from './types.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('shifts.router')}`

export default async function handler(
  request: Request<{ shiftId: string }, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const shift = await getShift(request.params.shiftId, request.session.user)

  if (shift === undefined) {
    response.redirect(`${redirectRoot}/?error=notFound`)
    return
  } else if (
    !(request.session.user?.userProperties.shifts.canManage ?? false) &&
    shift.supervisorUserName !== request.session.user?.userName
  ) {
    response.redirect(`${redirectRoot}/${shift.shiftId}/?error=forbidden`)
    return
  } else if (
    shift.recordLock_dateTime !== null &&
    shift.recordLock_dateTime !== undefined &&
    Date.now() >= shift.recordLock_dateTime.getTime()
  ) {
    response.redirect(`${redirectRoot}/${shift.shiftId}/?error=locked`)
    return
  }

  let supervisors = await getEmployees({ isSupervisor: true })

  if (!(request.session.user?.userProperties.shifts.canManage ?? false)) {
    supervisors = supervisors.filter(
      (supervisor) => supervisor.userName === request.session.user?.userName
    )
  }

  const shiftTypes = await getShiftTypeDataListItems(request.session.user)

  const shiftTimes = await getShiftTimeDataListItems(request.session.user)

  response.render('shifts/edit', {
    headTitle: `${getConfigProperty('shifts.sectionNameSingular')} #${
      request.params.shiftId
    }`,

    isCreate: false,
    isEdit: true,

    shift,

    shiftTimes,
    shiftTypes,
    supervisors
  } satisfies ShiftEditResponse)
}
