import type { Request, Response } from 'express'

import getDeletedWorkOrders from '../../database/workOrders/getDeletedWorkOrders.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrders = await getDeletedWorkOrders(request.session.user)

  response.json({
    success: true,
    workOrders
  })
}
