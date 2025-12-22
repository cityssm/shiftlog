import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createAdhocTask(adhocTaskTypeDataListItemId, taskDescription, locationAddress1, locationAddress2, locationCityProvince, locationLatitude, locationLongitude, fromLocationAddress1, fromLocationAddress2, fromLocationCityProvince, fromLocationLatitude, fromLocationLongitude, toLocationAddress1, toLocationAddress2, toLocationCityProvince, toLocationLatitude, toLocationLongitude, taskDueDateTimeString, sessionUser) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('adhocTaskTypeDataListItemId', adhocTaskTypeDataListItemId)
        .input('taskDescription', taskDescription)
        .input('locationAddress1', locationAddress1)
        .input('locationAddress2', locationAddress2)
        .input('locationCityProvince', locationCityProvince)
        .input('locationLatitude', locationLatitude ?? null)
        .input('locationLongitude', locationLongitude ?? null)
        .input('fromLocationAddress1', fromLocationAddress1)
        .input('fromLocationAddress2', fromLocationAddress2)
        .input('fromLocationCityProvince', fromLocationCityProvince)
        .input('fromLocationLatitude', fromLocationLatitude ?? null)
        .input('fromLocationLongitude', fromLocationLongitude ?? null)
        .input('toLocationAddress1', toLocationAddress1)
        .input('toLocationAddress2', toLocationAddress2)
        .input('toLocationCityProvince', toLocationCityProvince)
        .input('toLocationLatitude', toLocationLatitude ?? null)
        .input('toLocationLongitude', toLocationLongitude ?? null)
        .input('taskDueDateTimeString', taskDueDateTimeString ?? null)
        .input('recordCreate_userName', sessionUser.userName)
        .input('recordUpdate_userName', sessionUser.userName)
        .query(
    /* sql */ `
        insert into ShiftLog.AdhocTasks (
          adhocTaskTypeDataListItemId,
          taskDescription,
          locationAddress1,
          locationAddress2,
          locationCityProvince,
          locationLatitude,
          locationLongitude,
          fromLocationAddress1,
          fromLocationAddress2,
          fromLocationCityProvince,
          fromLocationLatitude,
          fromLocationLongitude,
          toLocationAddress1,
          toLocationAddress2,
          toLocationCityProvince,
          toLocationLatitude,
          toLocationLongitude,
          taskDueDateTime,
          recordCreate_userName,
          recordUpdate_userName
        ) values (
          @adhocTaskTypeDataListItemId,
          @taskDescription,
          @locationAddress1,
          @locationAddress2,
          @locationCityProvince,
          @locationLatitude,
          @locationLongitude,
          @fromLocationAddress1,
          @fromLocationAddress2,
          @fromLocationCityProvince,
          @fromLocationLatitude,
          @fromLocationLongitude,
          @toLocationAddress1,
          @toLocationAddress2,
          @toLocationCityProvince,
          @toLocationLatitude,
          @toLocationLongitude,
          @taskDueDateTimeString,
          @recordCreate_userName,
          @recordUpdate_userName
        )

        select SCOPE_IDENTITY() as adhocTaskId
      `);
    return result.recordset[0]?.adhocTaskId;
}
