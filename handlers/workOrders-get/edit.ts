import type { Request, Response } from 'express'

import getWorkOrder from '../../database/workOrders/getWorkOrder.js'
import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypeDataListItems from '../../database/workOrders/getWorkOrderTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import type { WorkOrderEditResponse } from './types.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

export default async function handler(
  request: Request<{ workOrderId: string }, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const workOrder = await getWorkOrder(request.params.workOrderId, request.session.user)

  if (workOrder === undefined) {
    response.redirect(`${redirectRoot}/?error=notFound`)
    return
  }

  const workOrderTypes = await getWorkOrderTypeDataListItems(request.session.user)

  const workOrderStatuses = await getWorkOrderStatusDataListItems(request.session.user)

  response.render('workOrders/edit', {
    headTitle: `${getConfigProperty('workOrders.sectionNameSingular')} #${
      workOrder.workOrderNumber
    }`,

    isCreate: false,
    isEdit: true,

    workOrder,

    workOrderTypes,
    workOrderStatuses,
    assignedToOptions: []
  } satisfies WorkOrderEditResponse)
}
