import type { Request, Response } from 'express'

import getDeletedWorkOrders from '../../database/workOrders/getDeletedWorkOrders.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      limit: number | string
      offset: number | string
    }
  >,
  response: Response
): Promise<void> {
  const { workOrders, totalCount } = await getDeletedWorkOrders(
    {
      limit: request.body.limit,
      offset: request.body.offset
    },
    request.session.user
  )

  response.json({
    success: true,
    workOrders,
    totalCount
  })
}
