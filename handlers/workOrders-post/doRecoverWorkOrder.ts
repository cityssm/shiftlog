import type { Request, Response } from 'express'

import recoverWorkOrder from '../../database/workOrders/recoverWorkOrder.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

export default async function handler(
  request: Request<unknown, unknown, { workOrderId: number | string }>,
  response: Response
): Promise<void> {
  const success = await recoverWorkOrder(
    request.body.workOrderId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true,
      message: 'Work order recovered successfully.',
      redirectUrl: `${redirectRoot}/${request.body.workOrderId}`
    })
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to recover work order.'
    })
  }
}
