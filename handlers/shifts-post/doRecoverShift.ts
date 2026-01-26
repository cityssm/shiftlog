import type { Request, Response } from 'express'

import recoverShift from '../../database/shifts/recoverShift.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('shifts.router')}`

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoRecoverShiftResponse = {
  success: boolean
  errorMessage?: string
  message?: string
  redirectUrl?: string
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoRecoverShiftResponse>
): Promise<void> {
  const success = await recoverShift(
    request.body.shiftId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true,
      message: 'Shift recovered successfully.',
      redirectUrl: `${redirectRoot}/${request.body.shiftId}`
    } satisfies DoRecoverShiftResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to recover shift.'
    } satisfies DoRecoverShiftResponse)
  }
}
