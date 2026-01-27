import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { AdhocTask } from '../../types/record.types.js'

export default async function getShiftAdhocTasks(
  shiftId: number | string
): Promise<AdhocTask[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('shiftId', shiftId)
    .query<AdhocTask>(/* sql */ `
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
        st.shiftAdhocTaskNote,
        t.recordCreate_userName,
        t.recordCreate_dateTime,
        t.recordUpdate_userName,
        t.recordUpdate_dateTime
      FROM
        ShiftLog.ShiftAdhocTasks st
        INNER JOIN ShiftLog.AdhocTasks t ON st.adhocTaskId = t.adhocTaskId
        LEFT JOIN ShiftLog.DataListItems td ON t.adhocTaskTypeDataListItemId = td.dataListItemId
      WHERE
        st.shiftId = @shiftId
        AND t.recordDelete_dateTime IS NULL
      ORDER BY
        t.taskDueDateTime,
        t.recordCreate_dateTime DESC
    `)

  return result.recordset
}
