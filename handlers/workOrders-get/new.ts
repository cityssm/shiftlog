import type { Request, Response } from 'express'

import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypeDataListItems from '../../database/workOrders/getWorkOrderTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

import type { WorkOrderEditResponse } from './types.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const workOrderTypes = await getWorkOrderTypeDataListItems(request.session.user)

  const workOrderStatuses = await getWorkOrderStatusDataListItems(request.session.user)

  const workOrder = {
    workOrderOpenDateTime: new Date(),
    workOrderTypeDataListItemId: -1,
    workOrderStatusDataListItemId: -1,
    workOrderDetails: '',
    requestorName: '',
    requestorContactInfo: '',
    locationAddress1: '',
    locationAddress2: '',
    locationCityProvince: ''
  } satisfies Partial<WorkOrder>

  response.render('workOrders/edit', {
    headTitle: `Create New ${getConfigProperty('workOrders.sectionNameSingular')}`,

    isCreate: true,
    isEdit: true,

    workOrder,

    workOrderTypes,
    workOrderStatuses,
    assignedToOptions: []
  } satisfies WorkOrderEditResponse)
}
