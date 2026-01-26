import type { Request, Response } from 'express'

import markEquipmentAsEntered from '../../database/timesheets/markEquipmentAsEntered.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoMarkEquipmentAsEnteredResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response<DoMarkEquipmentAsEnteredResponse>
): Promise<void> {
  const success = await markEquipmentAsEntered(
    request.body.timesheetId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  } satisfies DoMarkEquipmentAsEnteredResponse)
}
