import type { Request, Response } from 'express'

import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js'

export default async function handler(request: Request, response: Response): Promise<void> {
  const assignedToDataListItems = await getAssignedToDataListItems(request.session.user)

  response.render('dashboard/userSettings', {
    headTitle: 'User Settings',

    assignedToDataListItems
  })
}
