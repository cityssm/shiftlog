import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { AdhocTask } from '../../types/record.types.js'

export default async function getAvailableAdhocTasks(
  shiftId?: number | string
): Promise<AdhocTask[]> {
  const pool = await getShiftLogConnectionPool()

  const request = pool.request()

  let query = /* sql */ `
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
      (select count(*) from ShiftLog.ShiftAdhocTasks st where st.adhocTaskId = t.adhocTaskId) as shiftsCount,
      t.recordCreate_userName,
      t.recordCreate_dateTime,
      t.recordUpdate_userName,
      t.recordUpdate_dateTime
    from ShiftLog.AdhocTasks t
    left join ShiftLog.DataListItems td on t.adhocTaskTypeDataListItemId = td.dataListItemId
    where t.recordDelete_dateTime is null
      and t.taskCompleteDateTime is null
  `

  if (shiftId !== undefined && shiftId !== '') {
    request.input('shiftId', shiftId)
    query += /* sql */ `
      and t.adhocTaskId not in (
        select adhocTaskId from ShiftLog.ShiftAdhocTasks where shiftId = @shiftId
      )
    `
  }

  query += /* sql */ `
    order by t.taskDueDateTime, t.recordCreate_dateTime desc
  `

  const result = await request.query<AdhocTask>(query)

  return result.recordset
}
