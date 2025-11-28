import type { Request, Response } from 'express'

import getWorkOrder from '../../database/workOrders/getWorkOrder.js'
import getWorkOrderType from '../../database/workOrderTypes/getWorkOrderType.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

import type { WorkOrderEditResponse } from './types.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

export default async function handler(
  request: Request<
    { workOrderId: string },
    unknown,
    unknown,
    { error?: string }
  >,
  response: Response
): Promise<void> {
  const workOrder = await getWorkOrder(
    request.params.workOrderId,
    request.session.user
  )

  if (workOrder === undefined) {
    response.redirect(`${redirectRoot}/?error=notFound`)
    return
  }

  const workOrderType = (await getWorkOrderType(
    workOrder.workOrderTypeId,
    request.session.user,
    true
  )) as WorkOrderType

  response.render('workOrders/edit', {
    headTitle: `${getConfigProperty('workOrders.sectionNameSingular')} #${
      workOrder.workOrderNumber
    }`,

    isCreate: false,
    isEdit: false,

    workOrder,

    workOrderTypes: [workOrderType],
    workOrderStatuses: [],
    assignedToOptions: []
  } satisfies WorkOrderEditResponse)
}
