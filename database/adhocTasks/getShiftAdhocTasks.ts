import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { AdhocTask } from '../../types/record.types.js'

export default async function getShiftAdhocTasks(
  shiftId: number | string
): Promise<AdhocTask[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool.request().input('shiftId', shiftId)
    .query<AdhocTask>(/* sql */ `
      select
        t.adhocTaskId,
        t.adhocTaskTypeDataListItemId,
        td.dataListItem as adhocTaskTypeDataListItem,
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
      from ShiftLog.ShiftAdhocTasks st
      inner join ShiftLog.AdhocTasks t on st.adhocTaskId = t.adhocTaskId
      left join ShiftLog.DataListItems td on t.adhocTaskTypeDataListItemId = td.dataListItemId
      where st.shiftId = @shiftId
        and t.recordDelete_dateTime is null
      order by t.taskDueDateTime, t.recordCreate_dateTime desc
    `)

  return result.recordset
}
