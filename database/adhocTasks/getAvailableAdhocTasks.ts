import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { AdhocTask } from '../../types/record.types.js'

export default async function getAvailableAdhocTasks(
  shiftId?: number | string
): Promise<AdhocTask[]> {
  const pool = await getShiftLogConnectionPool()

  const request = pool.request()

  let query = /* sql */ `
    SELECT
      t.adhocTaskId,
      t.adhocTaskTypeDataListItemId,
      td.dataListItem AS adhocTaskTypeDataListItem,
      t.taskDescription,
      t.locationAddress1,
      t.locationAddress2,
      t.locationCityProvince,
      t.locationLatitude,
      t.locationLongitude,
      t.fromLocationAddress1,
      t.fromLocationAddress2,
      t.fromLocationCityProvince,
      t.fromLocationLatitude,
      t.fromLocationLongitude,
      t.toLocationAddress1,
      t.toLocationAddress2,
      t.toLocationCityProvince,
      t.toLocationLatitude,
      t.toLocationLongitude,
      t.taskDueDateTime,
      t.taskCompleteDateTime,
      (
        SELECT
          count(*)
        FROM
          ShiftLog.ShiftAdhocTasks st
        WHERE
          st.adhocTaskId = t.adhocTaskId
      ) AS shiftsCount,
      t.recordCreate_userName,
      t.recordCreate_dateTime,
      t.recordUpdate_userName,
      t.recordUpdate_dateTime
    FROM
      ShiftLog.AdhocTasks t
      LEFT JOIN ShiftLog.DataListItems td ON t.adhocTaskTypeDataListItemId = td.dataListItemId
    WHERE
      t.recordDelete_dateTime IS NULL
      AND t.taskCompleteDateTime IS NULL
  `

  if (shiftId !== undefined && shiftId !== '') {
    request.input('shiftId', shiftId)
    query += /* sql */ `
      AND t.adhocTaskId NOT IN (
        SELECT
          adhocTaskId
        FROM
          ShiftLog.ShiftAdhocTasks
        WHERE
          shiftId = @shiftId
      )
    `
  }

  query += /* sql */ `
    ORDER BY
      t.taskDueDateTime,
      t.recordCreate_dateTime DESC
  `

  const result = await request.query<AdhocTask>(query)

  return result.recordset
}
