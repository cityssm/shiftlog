import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateAdhocTask(
  adhocTaskId: number | string,
  adhocTaskTypeDataListItemId: number | string,
  taskDescription: string,
  locationAddress1: string,
  locationAddress2: string,
  locationCityProvince: string,
  locationLatitude: number | string | null | undefined,
  locationLongitude: number | string | null | undefined,
  fromLocationAddress1: string,
  fromLocationAddress2: string,
  fromLocationCityProvince: string,
  fromLocationLatitude: number | string | null | undefined,
  fromLocationLongitude: number | string | null | undefined,
  toLocationAddress1: string,
  toLocationAddress2: string,
  toLocationCityProvince: string,
  toLocationLatitude: number | string | null | undefined,
  toLocationLongitude: number | string | null | undefined,
  taskDueDateTimeString: string | null | undefined,
  taskCompleteDateTimeString: string | null | undefined,
  sessionUser: {
    userName: string
  }
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('adhocTaskId', adhocTaskId)
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
    .input('taskCompleteDateTimeString', taskCompleteDateTimeString ?? null)
    .input('recordUpdate_userName', sessionUser.userName)
    .query(
      /* sql */ `
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
      `
    )

  return result.rowsAffected[0] > 0
}
