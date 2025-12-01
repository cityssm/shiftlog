import type { Request, Response } from 'express'

import reopenWorkOrder from '../../database/workOrders/reopenWorkOrder.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

export default async function handler(
  request: Request<unknown, unknown, { workOrderId: number | string }>,
  response: Response
): Promise<void> {
  const success = await reopenWorkOrder(
    request.body.workOrderId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      message: 'Work order reopened successfully.',
      redirectUrl: `${redirectRoot}/${request.body.workOrderId}`,
      success: true
    })
  } else {
    response.json({
      errorMessage: 'Failed to reopen work order.',
      success: false
    })
  }
}
