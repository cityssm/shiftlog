import type { Request, Response } from 'express'

import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { tab?: string; error?: string }>,
  response: Response
): Promise<void> {
  const activeTab = request.query.tab ?? ''

  const assignedToDataListItems = await getAssignedToDataListItems()

  response.render('dashboard/reports', {
    headTitle: 'Reports and Exports',

    activeTab,

    assignedToDataListItems
  })
}
