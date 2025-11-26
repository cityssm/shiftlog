import type { Request, Response } from 'express'

import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypeDataListItems from '../../database/workOrders/getWorkOrderTypeDataListItems.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
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
    workOrderTypeDataListItemId: workOrderTypes.length === 1 ? workOrderTypes[0].dataListItemId : undefined,

    workOrderDetails: '',
    workOrderOpenDateTime: new Date(),

    requestorContactInfo: '',
    requestorName: request.session.user?.firstName + ' ' + request.session.user?.lastName,

    locationAddress1: '',
    locationAddress2: '',
    locationCityProvince: await getCachedSettingValue('locations.defaultCityProvince'),
  } satisfies Partial<WorkOrder>

  response.render('workOrders/edit', {
    headTitle: `Create New ${getConfigProperty('workOrders.sectionNameSingular')}`,

    isCreate: true,
    isEdit: true,

    workOrder,

    assignedToOptions: [],
    workOrderStatuses,
    workOrderTypes,
  } satisfies WorkOrderEditResponse)
}
