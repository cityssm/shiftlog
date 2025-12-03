import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface DataList {
  dataListKey: string
  dataListName: string
  isSystemList: boolean
}

export default async function getDataLists(): Promise<DataList[]> {
  const pool = await getShiftLogConnectionPool()

  const dataListsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<DataList>(/* sql */ `
      select dataListKey, dataListName, isSystemList
      from ShiftLog.DataLists
      where recordDelete_dateTime is null
        and instance = @instance
      order by dataListName
    `)

  return dataListsResult.recordset
}
