import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface RecoverDataListForm {
  dataListKey: string
  dataListName: string
  userName: string
}

export default async function recoverDataList(
  form: RecoverDataListForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('dataListKey', form.dataListKey)
      .input('dataListName', form.dataListName)
      .input('userName', form.userName)
      .query(/* sql */ `
        UPDATE ShiftLog.DataLists
        SET
          dataListName = @dataListName,
          recordDelete_userName = NULL,
          recordDelete_dateTime = NULL,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        WHERE
          instance = @instance
          AND dataListKey = @dataListKey
          AND recordDelete_dateTime IS NOT NULL
          AND isSystemList = 0
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
