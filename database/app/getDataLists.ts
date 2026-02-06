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
      SELECT
        dataListKey,
        dataListName,
        isSystemList
      FROM
        ShiftLog.DataLists
      WHERE
        recordDelete_dateTime IS NULL
        AND instance = @instance
      ORDER BY
        isSystemList ASC,
        dataListName
    `)

  return dataListsResult.recordset
}
