import type { Request, Response } from 'express'

import deleteShift from '../../database/shifts/deleteShift.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('shifts.router')}`

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteShiftResponse = {
  success: boolean
  errorMessage?: string
  redirectUrl?: string
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoDeleteShiftResponse>
): Promise<void> {
  const success = await deleteShift(
    request.body.shiftId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true,
      redirectUrl: redirectRoot
    } satisfies DoDeleteShiftResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to delete shift.'
    } satisfies DoDeleteShiftResponse)
  }
}
