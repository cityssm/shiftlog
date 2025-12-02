import type { Request, Response } from 'express'

import getShift from '../../database/shifts/getShift.js'
import getShiftCrews from '../../database/shifts/getShiftCrews.js'
import getShiftEmployees from '../../database/shifts/getShiftEmployees.js'
import getShiftEquipment from '../../database/shifts/getShiftEquipment.js'
import getShiftWorkOrders from '../../database/shifts/getShiftWorkOrders.js'
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
  }

  const shiftCrews = await getShiftCrews(request.params.shiftId)
  const shiftEmployees = await getShiftEmployees(request.params.shiftId)
  const shiftEquipment = await getShiftEquipment(request.params.shiftId)
  const shiftWorkOrders = await getShiftWorkOrders(request.params.shiftId)

  response.render('shifts/edit', {
    headTitle: `${getConfigProperty('shifts.sectionNameSingular')} #${
      request.params.shiftId
    }`,

    isCreate: false,
    isEdit: false,

    shift,
    shiftCrews,
    shiftEmployees,
    shiftEquipment,
    shiftWorkOrders,

    shiftTimes: [],
    shiftTypes: [],
    supervisors: []
  } satisfies ShiftEditResponse)
}
