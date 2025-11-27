import type { Request, Response } from 'express'

import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const workOrderTypes = await getWorkOrderTypesAdmin()
  const userGroups = await getUserGroups()

  response.render('admin/workOrderTypes', {
    headTitle: 'Work Order Type Maintenance',
    workOrderTypes,
    userGroups
  })
}
