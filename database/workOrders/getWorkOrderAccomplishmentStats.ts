import { dateToString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface WorkOrderAccomplishmentStats {
  percentClosed: number
  totalClosed: number
  totalOpen: number
}

export interface WorkOrderTimeSeriesData {
  openWorkOrdersCount: number
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
  }>(/* sql */ `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN w.workOrderCloseDateTime IS NULL THEN 1
            ELSE 0
          END
        ),
        0
      ) AS totalOpen,
      COALESCE(
        SUM(
          CASE
            WHEN w.workOrderCloseDateTime IS NOT NULL THEN 1
            ELSE 0
          END
        ),
        0
      ) AS totalClosed
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND (
        (
          w.workOrderOpenDateTime >= @startDate
          AND w.workOrderOpenDateTime <= DATEADD(day, 1, @endDate)
        )
        OR (
          w.workOrderCloseDateTime >= @startDate
          AND w.workOrderCloseDateTime <= DATEADD(day, 1, @endDate)
        )
      ) ${userGroupFilter}
  `)

  const stats = statsResult.recordset[0]
  const totalOpen = stats.totalOpen
  const totalClosed = stats.totalClosed
  const total = totalOpen + totalClosed
  const hundredPercent = 100
  const percentClosed = total > 0 ? (totalClosed / total) * hundredPercent : 0

  // 2. Get time series data (count of open work orders at each time bucket)
  const timeSeriesRequest = pool.request()
  timeSeriesRequest
    .input('instance', instance)
    .input('startDate', startDateString)
    .input('endDate', endDateString)
    .input('userName', user?.userName)

  // Generate time buckets and count open work orders at each point
  // For month: daily buckets, For year: monthly buckets (using last day of month)
  const timeSeriesResult = await timeSeriesRequest.query<{
    openWorkOrdersCount: number
    periodLabel: string
  }>(/* sql */ `
    WITH
      DateBuckets AS (
        SELECT
          ${filterType === 'month'
          ? /* sql */ `
              CAST(DATEADD(day, number, @startDate) AS DATE) AS bucketDate
              FROM
                master..spt_values
              WHERE
              TYPE = 'P'
              AND DATEADD(day, number, @startDate) <= @endDate
            `
          : /* sql */ `
              EOMONTH(
                DATEFROMPARTS(
                  YEAR(@startDate) + (MONTH(@startDate) + number - 1) / 12,
                  ((MONTH(@startDate) + number - 1) % 12) + 1,
                  1
                )
              ) AS bucketDate
              FROM
                master..spt_values
              WHERE
              TYPE = 'P'
              AND EOMONTH(
                DATEFROMPARTS(
                  YEAR(@startDate) + (MONTH(@startDate) + number - 1) / 12,
                  ((MONTH(@startDate) + number - 1) % 12) + 1,
                  1
                )
              ) <= @endDate
            `}
      )
    SELECT
      ${filterType === 'month'
        ? "FORMAT(db.bucketDate, 'yyyy-MM-dd')"
        : "FORMAT(db.bucketDate, 'yyyy-MM')"} AS periodLabel,
      COUNT(w.workOrderId) AS openWorkOrdersCount
    FROM
      DateBuckets db
      LEFT JOIN ShiftLog.WorkOrders w ON w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime <= db.bucketDate
      AND (
        w.workOrderCloseDateTime IS NULL
        OR w.workOrderCloseDateTime > db.bucketDate
      )
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId ${userGroupFilter}
    GROUP BY
      db.bucketDate
    ORDER BY
      db.bucketDate
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
    SELECT
      TOP 10 COALESCE(assignedTo.assignedToName, '(Unassigned)') AS assignedToName,
      COUNT(*) AS openedCount,
      SUM(
        CASE
          WHEN w.workOrderCloseDateTime IS NOT NULL THEN 1
          ELSE 0
        END
      ) AS closedCount
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime < DATEADD(day, 1, @endDate)
      AND (
        w.workOrderCloseDateTime IS NULL
        OR w.workOrderCloseDateTime >= @startDate
      ) ${userGroupFilter}
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
    SELECT
      TOP 50 wot.tagName,
      COUNT(*) AS count
    FROM
      ShiftLog.WorkOrderTags wot
      INNER JOIN ShiftLog.WorkOrders w ON wot.workOrderId = w.workOrderId
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime < DATEADD(day, 1, @endDate)
      AND (
        w.workOrderCloseDateTime IS NULL
        OR w.workOrderCloseDateTime >= @startDate
      ) ${userGroupFilter}
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
      SUM(
        CASE
          WHEN w.workOrderCloseDateTime IS NULL THEN 1
          ELSE 0
        END
      ) AS openCount,
      SUM(
        CASE
          WHEN w.workOrderCloseDateTime IS NOT NULL THEN 1
          ELSE 0
        END
      ) AS closedCount
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
    WHERE
      w.instance = @instance
      AND w.recordDelete_dateTime IS NULL
      AND w.workOrderOpenDateTime < DATEADD(day, 1, @endDate)
      AND (
        w.workOrderCloseDateTime IS NULL
        OR w.workOrderCloseDateTime >= @startDate
      )
      AND w.locationLatitude IS NOT NULL
      AND w.locationLongitude IS NOT NULL ${userGroupFilter}
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
      percentClosed,
      totalClosed,
      totalOpen
    },
    tags,
    timeSeries
  }
}
