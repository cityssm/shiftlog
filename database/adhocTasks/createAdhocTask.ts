import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

type LatitudeLongitude = number | string | null | undefined

export default async function createAdhocTask(
  task: {
    adhocTaskTypeDataListItemId: number | string
    taskDescription: string

    locationAddress1: string
    locationAddress2: string
    locationCityProvince: string
    locationLatitude: LatitudeLongitude
    locationLongitude: LatitudeLongitude

    fromLocationAddress1: string
    fromLocationAddress2: string
    fromLocationCityProvince: string
    fromLocationLatitude: LatitudeLongitude
    fromLocationLongitude: LatitudeLongitude

    toLocationAddress1: string
    toLocationAddress2: string
    toLocationCityProvince: string
    toLocationLatitude: LatitudeLongitude
    toLocationLongitude: LatitudeLongitude

    taskDueDateTimeString: string | null | undefined
  },
  sessionUser: {
    userName: string
  }
): Promise<number | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('adhocTaskTypeDataListItemId', task.adhocTaskTypeDataListItemId)
    .input('taskDescription', task.taskDescription)

    .input('locationAddress1', task.locationAddress1)
    .input('locationAddress2', task.locationAddress2)
    .input('locationCityProvince', task.locationCityProvince)
    .input(
      'locationLatitude',
      (task.locationLatitude ?? '') === '' ? null : task.locationLatitude
    )
    .input(
      'locationLongitude',
      (task.locationLongitude ?? '') === '' ? null : task.locationLongitude
    )

    .input('fromLocationAddress1', task.fromLocationAddress1)
    .input('fromLocationAddress2', task.fromLocationAddress2)
    .input('fromLocationCityProvince', task.fromLocationCityProvince)
    .input(
      'fromLocationLatitude',
      (task.fromLocationLatitude ?? '') === ''
        ? null
        : task.fromLocationLatitude
    )
    .input(
      'fromLocationLongitude',
      (task.fromLocationLongitude ?? '') === ''
        ? null
        : task.fromLocationLongitude
    )

    .input('toLocationAddress1', task.toLocationAddress1)
    .input('toLocationAddress2', task.toLocationAddress2)
    .input('toLocationCityProvince', task.toLocationCityProvince)
    .input(
      'toLocationLatitude',
      (task.toLocationLatitude ?? '') === '' ? null : task.toLocationLatitude
    )
    .input(
      'toLocationLongitude',
      (task.toLocationLongitude ?? '') === '' ? null : task.toLocationLongitude
    )

    .input(
      'taskDueDateTimeString',
      (task.taskDueDateTimeString ?? '') === ''
        ? null
        : task.taskDueDateTimeString
    )

    .input('recordCreate_userName', sessionUser.userName)
    .input('recordUpdate_userName', sessionUser.userName).query<{
    adhocTaskId: number
  }>(/* sql */ `
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
      `)

  return result.recordset[0].adhocTaskId as number | undefined
}
