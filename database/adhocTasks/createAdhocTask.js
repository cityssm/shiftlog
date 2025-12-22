// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
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
        .input('locationLatitude', (locationLatitude ?? '') === '' ? null : locationLatitude)
        .input('locationLongitude', (locationLongitude ?? '') === '' ? null : locationLongitude)
        .input('fromLocationAddress1', fromLocationAddress1)
        .input('fromLocationAddress2', fromLocationAddress2)
        .input('fromLocationCityProvince', fromLocationCityProvince)
        .input('fromLocationLatitude', (fromLocationLatitude ?? '') === '' ? null : fromLocationLatitude)
        .input('fromLocationLongitude', (fromLocationLongitude ?? '') === '' ? null : fromLocationLongitude)
        .input('toLocationAddress1', toLocationAddress1)
        .input('toLocationAddress2', toLocationAddress2)
        .input('toLocationCityProvince', toLocationCityProvince)
        .input('toLocationLatitude', (toLocationLatitude ?? '') === '' ? null : toLocationLatitude)
        .input('toLocationLongitude', (toLocationLongitude ?? '') === '' ? null : toLocationLongitude)
        .input('taskDueDateTimeString', (taskDueDateTimeString ?? '') === '' ? null : taskDueDateTimeString)
        .input('recordCreate_userName', sessionUser.userName)
        .input('recordUpdate_userName', sessionUser.userName).query(/* sql */ `
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
