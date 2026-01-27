import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateDataListForm {
  dataListKey: string
  dataListName: string
  isSystemList: boolean
}

export default async function createDataList(
  form: CreateDataListForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('dataListKey', form.dataListKey)
      .input('dataListName', form.dataListName)
      .input('isSystemList', form.isSystemList)
      .input('userName', userName)
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.DataLists (
            instance,
            dataListKey,
            dataListName,
            isSystemList,
            recordCreate_userName,
            recordUpdate_userName
          )
        VALUES
          (
            @instance,
            @dataListKey,
            @dataListName,
            @isSystemList,
            @userName,
            @userName
          )
      `)

    return true
  } catch {
    return false
  }
}
