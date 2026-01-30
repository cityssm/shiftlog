import type { Request, Response } from 'express'

import getAssignedToList from '../../database/assignedTo/getAssignedToList.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { tab?: string; error?: string }>,
  response: Response
): Promise<void> {
  const activeTab = request.query.tab ?? ''

  const assignedToDataListItems = await getAssignedToList(
    request.session.user?.userName
  )

  response.render('dashboard/reports', {
    headTitle: 'Reports and Exports',
    section: 'timesheets',

    activeTab,

    assignedToDataListItems
  })
}
