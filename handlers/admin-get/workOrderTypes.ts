import type { Request, Response } from 'express'

import getUserGroups from '../../database/users/getUserGroups.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { availableWorkOrderMoreInfoForms } from '../../helpers/workOrderMoreInfoForms.helpers.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const userGroups = await getUserGroups()
  const workOrderTypes = await getWorkOrderTypesAdmin()

  response.render('admin/workOrderTypes', {
    headTitle: `${getConfigProperty('workOrders.sectionNameSingular')} Type Maintenance`,
    section: 'admin',

    availableWorkOrderMoreInfoForms,
    userGroups,
    workOrderTypes
  })
}
