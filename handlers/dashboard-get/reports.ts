import type { Request, Response } from 'express'

import getAssignedToList from '../../database/assignedTo/getAssignedToList.js'
import type { rawExportReports } from '../../database/reports/admin.reports.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { tab?: string; error?: string }>,
  response: Response
): Promise<void> {
  const activeTab = request.query.tab ?? ''

  const assignedToDataListItems = await getAssignedToList(
    request.session.user?.userName
  )

  const rawExports: Array<{
    exportName: keyof typeof rawExportReports
    tableName: string
  }> = []

  if (request.session.user?.userProperties.isAdmin) {
    if (getConfigProperty('workOrders.isEnabled')) {
      rawExports.push(
        {
          exportName: 'admin-workOrders-raw',
          tableName: 'Work Orders'
        },
        {
          exportName: 'admin-workOrderCosts-raw',
          tableName: 'Work Order Costs'
        },
        {
          exportName: 'admin-workOrderMilestones-raw',
          tableName: 'Work Order Milestones'
        },
        {
          exportName: 'admin-workOrderNotes-raw',
          tableName: 'Work Order Notes'
        },
        {
          exportName: 'admin-workOrderTags-raw',
          tableName: 'Work Order Tags'
        }
      )
    }

    if (getConfigProperty('shifts.isEnabled')) {
      rawExports.push({ exportName: 'admin-shifts-raw', tableName: 'Shifts' })
    }

    if (getConfigProperty('timesheets.isEnabled')) {
      rawExports.push({
        exportName: 'admin-timesheets-raw',
        tableName: 'Timesheets'
      })
    }
  }

  response.render('dashboard/reports', {
    headTitle: 'Reports and Exports',
    section: 'reports',

    activeTab,

    assignedToDataListItems,

    rawExports
  })
}
