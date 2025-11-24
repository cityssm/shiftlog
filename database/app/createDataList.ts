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
      .input('dataListKey', form.dataListKey)
      .input('dataListName', form.dataListName)
      .input('isSystemList', form.isSystemList)
      .input('userName', userName).query(/* sql */ `
        insert into ShiftLog.DataLists (
          dataListKey, dataListName, isSystemList,
          recordCreate_userName, recordUpdate_userName
        )
        values (
          @dataListKey, @dataListName, @isSystemList,
          @userName, @userName
        )
      `)

    return true
  } catch {
    return false
  }
}
