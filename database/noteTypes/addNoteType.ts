import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface AddNoteTypeForm {
  noteType: string
  userGroupId?: number | null
  isAvailableWorkOrders: boolean
  isAvailableShifts: boolean
  isAvailableTimesheets: boolean
}

export default async function addNoteType(
  noteTypeFields: AddNoteTypeForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('noteType', noteTypeFields.noteType)
      .input('userGroupId', noteTypeFields.userGroupId ?? null)
      .input('isAvailableWorkOrders', noteTypeFields.isAvailableWorkOrders)
      .input('isAvailableShifts', noteTypeFields.isAvailableShifts)
      .input('isAvailableTimesheets', noteTypeFields.isAvailableTimesheets)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.NoteTypes (
            instance,
            noteType,
            userGroupId,
            isAvailableWorkOrders,
            isAvailableShifts,
            isAvailableTimesheets,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @instance,
            @noteType,
            @userGroupId,
            @isAvailableWorkOrders,
            @isAvailableShifts,
            @isAvailableTimesheets,
            @recordCreate_userName,
            @recordCreate_dateTime,
            @recordUpdate_userName,
            @recordUpdate_dateTime
          )
      `)

    return true
  } catch {
    return false
  }
}
