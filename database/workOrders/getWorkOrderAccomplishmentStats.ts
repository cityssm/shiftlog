import { dateToString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface WorkOrderAccomplishmentStats {
  percentClosed: number
  totalClosed: number
  totalOpen: number
  totalOverdue: number
}

export interface WorkOrderTimeSeriesData {
  closedCount: number
  openCount: number
  periodLabel: string
}

export interface WorkOrderByAssignedTo {
  assignedToName: string
  closedCount: number
  openedCount: number
}

export interface WorkOrderTagStatistic {
  count: number
  tagName: string
}

export interface WorkOrderHotZone {
  closedCount: number
  count: number
  latitude: number
  longitude: number
  openCount: number
}

export interface WorkOrderAccomplishmentData {
  byAssignedTo: WorkOrderByAssignedTo[]
  hotZones: WorkOrderHotZone[]
  stats: WorkOrderAccomplishmentStats
  tags: WorkOrderTagStatistic[]
  timeSeries: WorkOrderTimeSeriesData[]
}

/**
 * Get work order accomplishment statistics for a date range
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 * @param filterType - 'month' or 'year' for time series grouping
 * @param user - Optional user for permission filtering
 * @returns Work order accomplishment data
 */
export default async function getWorkOrderAccomplishmentStats(
  startDate: Date,
  endDate: Date,
  filterType: 'month' | 'year',
  user?: User
): Promise<WorkOrderAccomplishmentData> {
  const pool = await getShiftLogConnectionPool()
  const instance = getConfigProperty('application.instance')

  const startDateString = dateToString(startDate)
  const endDateString = dateToString(endDate)

  // Build user group filter
  const userGroupFilter = user
    ? /* sql */ `
        AND (
          wType.userGroupId IS NULL
          OR wType.userGroupId IN (
            SELECT
              userGroupId
            FROM
              ShiftLog.UserGroupMembers
            WHERE
              userName = @userName
          )
        )
      `
    : ''

  // 1. Get overall statistics
  const statsRequest = pool.request()
  statsRequest
    .input('instance', instance)
    .input('startDate', startDateString)
    .input('endDate', endDateString)
    .input('userName', user?.userName)

  const statsResult = await statsRequest.query<{
    totalClosed: number
    totalOpen: number
    totalOverdue: number
  }>(/* sql */ `
    SELECT
      SUM(CASE WHEN w.workOrderCloseDateTime IS NULL THEN 1 ELSE 0 END) AS totalOpen,
      SUM(CASE WHEN w.workOrderCloseDateTime IS NOT NULL THEN 1 ELSE 0 END) AS totalClosed,
      SUM(
        CASE
          WHEN w.workOrderCloseDateTime IS NULL
          AND w.workOrderDueDateTime IS NOT NULL
          AND w.workOrderDueDateTime < GETDATE() THEN 1
          ELSE 0
        END
      ) AS totalOverdue
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime >= @startDate
      AND w.workOrderOpenDateTime <= DATEADD(day, 1, @endDate)
      ${userGroupFilter}
  `)

  const stats = statsResult.recordset[0]
  const total = stats.totalOpen + stats.totalClosed
  const hundredPercent = 100
  const percentClosed = total > 0 ? (stats.totalClosed / total) * hundredPercent : 0

  // 2. Get time series data (grouped by month or year)
  const timeSeriesRequest = pool.request()
  timeSeriesRequest
    .input('instance', instance)
    .input('startDate', startDateString)
    .input('endDate', endDateString)
    .input('userName', user?.userName)

  const dateGroupFormat =
    filterType === 'month' ? "FORMAT(w.workOrderOpenDateTime, 'yyyy-MM')" : 'YEAR(w.workOrderOpenDateTime)'

  const timeSeriesResult = await timeSeriesRequest.query<{
    closedCount: number
    openCount: number
    periodLabel: string
  }>(/* sql */ `
    SELECT
      ${dateGroupFormat} AS periodLabel,
      SUM(CASE WHEN w.workOrderCloseDateTime IS NULL THEN 1 ELSE 0 END) AS openCount,
      SUM(CASE WHEN w.workOrderCloseDateTime IS NOT NULL THEN 1 ELSE 0 END) AS closedCount
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime >= @startDate
      AND w.workOrderOpenDateTime <= DATEADD(day, 1, @endDate)
      ${userGroupFilter}
    GROUP BY
      ${dateGroupFormat}
    ORDER BY
      periodLabel
  `)

  const timeSeries = timeSeriesResult.recordset

  // 3. Get work orders by assigned to
  const byAssignedToRequest = pool.request()
  byAssignedToRequest
    .input('instance', instance)
    .input('startDate', startDateString)
    .input('endDate', endDateString)
    .input('userName', user?.userName)

  const byAssignedToResult = await byAssignedToRequest.query<{
    assignedToName: string | null
    closedCount: number
    openedCount: number
  }>(/* sql */ `
    SELECT TOP 10
      COALESCE(assignedTo.assignedToName, '(Unassigned)') AS assignedToName,
      COUNT(*) AS openedCount,
      SUM(CASE WHEN w.workOrderCloseDateTime IS NOT NULL THEN 1 ELSE 0 END) AS closedCount
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime >= @startDate
      AND w.workOrderOpenDateTime <= DATEADD(day, 1, @endDate)
      ${userGroupFilter}
    GROUP BY
      assignedTo.assignedToName
    ORDER BY
      openedCount DESC
  `)

  const byAssignedTo = byAssignedToResult.recordset.map((row) => ({
    assignedToName: row.assignedToName ?? '(Unassigned)',
    closedCount: row.closedCount,
    openedCount: row.openedCount
  }))

  // 4. Get tag statistics
  const tagsRequest = pool.request()
  tagsRequest
    .input('instance', instance)
    .input('startDate', startDateString)
    .input('endDate', endDateString)
    .input('userName', user?.userName)

  const tagsResult = await tagsRequest.query<{
    count: number
    tagName: string
  }>(/* sql */ `
    SELECT TOP 50
      wot.tagName,
      COUNT(*) AS count
    FROM
      ShiftLog.WorkOrderTags wot
      INNER JOIN ShiftLog.WorkOrders w ON wot.workOrderId = w.workOrderId
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime >= @startDate
      AND w.workOrderOpenDateTime <= DATEADD(day, 1, @endDate)
      ${userGroupFilter}
    GROUP BY
      wot.tagName
    ORDER BY
      count DESC
  `)

  const tags = tagsResult.recordset

  // 5. Get hot zones (work orders grouped by location)
  const hotZonesRequest = pool.request()
  hotZonesRequest
    .input('instance', instance)
    .input('startDate', startDateString)
    .input('endDate', endDateString)
    .input('userName', user?.userName)

  const hotZonesResult = await hotZonesRequest.query<{
    closedCount: number
    count: number
    latitude: number
    longitude: number
    openCount: number
  }>(/* sql */ `
    SELECT
      w.locationLatitude AS latitude,
      w.locationLongitude AS longitude,
      COUNT(*) AS count,
      SUM(CASE WHEN w.workOrderCloseDateTime IS NULL THEN 1 ELSE 0 END) AS openCount,
      SUM(CASE WHEN w.workOrderCloseDateTime IS NOT NULL THEN 1 ELSE 0 END) AS closedCount
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime >= @startDate
      AND w.workOrderOpenDateTime <= DATEADD(day, 1, @endDate)
      AND w.locationLatitude IS NOT NULL
      AND w.locationLongitude IS NOT NULL
      ${userGroupFilter}
    GROUP BY
      w.locationLatitude,
      w.locationLongitude
    HAVING
      COUNT(*) > 0
    ORDER BY
      count DESC
  `)

  const hotZones = hotZonesResult.recordset

  return {
    byAssignedTo,
    hotZones,
    stats: {
      ...stats,
      percentClosed
    },
    tags,
    timeSeries
  }
}
