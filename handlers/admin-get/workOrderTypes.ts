import type { Request, Response } from 'express'

import getUserGroups from '../../database/users/getUserGroups.js'
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const userGroups = await getUserGroups()
  const workOrderTypes = await getWorkOrderTypesAdmin()

  response.render('admin/workOrderTypes', {
    headTitle: 'Work Order Type Maintenance',
    userGroups,
    workOrderTypes
  })
}
