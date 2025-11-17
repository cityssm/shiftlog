import type { Request, Response } from 'express'

import markEquipmentAsEntered from '../../database/timesheets/markEquipmentAsEntered.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response
): Promise<void> {
  const success = await markEquipmentAsEntered(
    request.body.timesheetId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
