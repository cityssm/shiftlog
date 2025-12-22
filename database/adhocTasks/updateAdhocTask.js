// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateAdhocTask(task, sessionUser) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('adhocTaskId', task.adhocTaskId)
        .input('adhocTaskTypeDataListItemId', task.adhocTaskTypeDataListItemId)
        .input('taskDescription', task.taskDescription)
        .input('locationAddress1', task.locationAddress1)
        .input('locationAddress2', task.locationAddress2)
        .input('locationCityProvince', task.locationCityProvince)
        .input('locationLatitude', (task.locationLatitude ?? '') === '' ? null : task.locationLatitude)
        .input('locationLongitude', (task.locationLongitude ?? '') === '' ? null : task.locationLongitude)
        .input('fromLocationAddress1', task.fromLocationAddress1)
        .input('fromLocationAddress2', task.fromLocationAddress2)
        .input('fromLocationCityProvince', task.fromLocationCityProvince)
        .input('fromLocationLatitude', (task.fromLocationLatitude ?? '') === ''
        ? null
        : task.fromLocationLatitude)
        .input('fromLocationLongitude', (task.fromLocationLongitude ?? '') === ''
        ? null
        : task.fromLocationLongitude)
        .input('toLocationAddress1', task.toLocationAddress1)
        .input('toLocationAddress2', task.toLocationAddress2)
        .input('toLocationCityProvince', task.toLocationCityProvince)
        .input('toLocationLatitude', (task.toLocationLatitude ?? '') === '' ? null : task.toLocationLatitude)
        .input('toLocationLongitude', (task.toLocationLongitude ?? '') === '' ? null : task.toLocationLongitude)
        .input('taskDueDateTimeString', (task.taskDueDateTimeString ?? '') === ''
        ? null
        : task.taskDueDateTimeString)
        .input('taskCompleteDateTimeString', (task.taskCompleteDateTimeString ?? '') === ''
        ? null
        : task.taskCompleteDateTimeString)
        .input('recordUpdate_userName', sessionUser.userName).query(/* sql */ `
        update ShiftLog.AdhocTasks
        set
          adhocTaskTypeDataListItemId = @adhocTaskTypeDataListItemId,
          taskDescription = @taskDescription,
          locationAddress1 = @locationAddress1,
          locationAddress2 = @locationAddress2,
          locationCityProvince = @locationCityProvince,
          locationLatitude = @locationLatitude,
          locationLongitude = @locationLongitude,
          fromLocationAddress1 = @fromLocationAddress1,
          fromLocationAddress2 = @fromLocationAddress2,
          fromLocationCityProvince = @fromLocationCityProvince,
          fromLocationLatitude = @fromLocationLatitude,
          fromLocationLongitude = @fromLocationLongitude,
          toLocationAddress1 = @toLocationAddress1,
          toLocationAddress2 = @toLocationAddress2,
          toLocationCityProvince = @toLocationCityProvince,
          toLocationLatitude = @toLocationLatitude,
          toLocationLongitude = @toLocationLongitude,
          taskDueDateTime = @taskDueDateTimeString,
          taskCompleteDateTime = @taskCompleteDateTimeString,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = getdate()
        where adhocTaskId = @adhocTaskId
          and recordDelete_dateTime is null
      `);
    return result.rowsAffected[0] > 0;
}
