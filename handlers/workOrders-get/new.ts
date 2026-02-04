import type { Request, Response } from 'express'

import getAssignedToList from '../../database/assignedTo/getAssignedToList.js'
import getWorkOrderPriorityDataListItems from '../../database/workOrders/getWorkOrderPriorityDataListItems.js'
import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

import type { WorkOrderEditResponse } from './types.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const workOrderTypes = await getWorkOrderTypes(request.session.user)

  const workOrderStatuses = await getWorkOrderStatusDataListItems(request.session.user)

  const workOrderPriorities = await getWorkOrderPriorityDataListItems(request.session.user)

  const assignedToOptions = await getAssignedToList(request.session.user?.userName)

  const workOrder = {
    workOrderTypeId: workOrderTypes.length === 1 ? workOrderTypes[0].workOrderTypeId : undefined,

    workOrderDetails: '',
    workOrderOpenDateTime: new Date(),
    workOrderDueDateTime: null,
    workOrderCloseDateTime: null,

    requestorContactInfo: '',
    requestorName: `${request.session.user?.firstName} ${request.session.user?.lastName}`.trim(),

    locationAddress1: '',
    locationAddress2: '',
    locationCityProvince: await getCachedSettingValue('locations.defaultCityProvince'),
  } satisfies Partial<WorkOrder>

  response.render('workOrders/edit', {
    headTitle: `Create New ${getConfigProperty('workOrders.sectionNameSingular')}`,
    section: 'workOrders',

    isCreate: true,
    isEdit: true,

    workOrder,

    assignedToOptions,
    workOrderStatuses,
    workOrderPriorities,
    workOrderTypes,
  } satisfies WorkOrderEditResponse)
}
