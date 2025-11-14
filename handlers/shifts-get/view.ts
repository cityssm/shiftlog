import type { Request, Response } from 'express'

import getShift from '../../database/shifts/getShift.js'
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

  response.render('shifts/edit', {
    headTitle: `${getConfigProperty('shifts.sectionNameSingular')} #${
      request.params.shiftId
    }`,

    isCreate: false,
    isEdit: false,

    shift,

    shiftTimes: [],
    shiftTypes: [],
    supervisors: []
  } satisfies ShiftEditResponse)
}
