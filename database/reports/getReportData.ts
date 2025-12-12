import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { DatabaseUser } from '../../types/record.types.js'

import adminReports from './admin.reports.js'
import type { ReportDefinition, ReportParameters } from './types.js'
import workOrderReports from './workOrder.reports.js'

const reports: Record<string, ReportDefinition | undefined> = {
  ...workOrderReports,
  ...adminReports
}

function userHasReportAccess(reportKey: string, user: DatabaseUser): boolean {
  if (reportKey.startsWith('workOrders-')) {
    return user.workOrders_canView
  }

  if (reportKey.startsWith('admin-')) {
    return user.isAdmin
  }

  return false
}

export default async function getReportData(
  reportKey: string,
  reportParameters: ReportParameters,
  user: DatabaseUser
): Promise<unknown[] | undefined> {
  if (!userHasReportAccess(reportKey, user)) {
    return undefined
  }

  const reportDefinition = reports[reportKey]

  if (reportDefinition === undefined) {
    return undefined
  }

  const pool = await getShiftLogConnectionPool()

  const request = pool.request()

  // Add standard parameters
  request.input('instance', getConfigProperty('application.instance'))
  request.input('userName', user.userName)

  // Add report parameters
  for (const parameterName of reportDefinition.parameterNames) {
    // eslint-disable-next-line security/detect-object-injection
    const parameterValue = reportParameters[parameterName]
    request.input(parameterName, parameterValue)
  }

  const result = await request.query(reportDefinition.sql)

  return result.recordset
}
