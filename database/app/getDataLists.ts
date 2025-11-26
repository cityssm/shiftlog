import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface DataList {
  dataListKey: string
  dataListName: string
  isSystemList: boolean
}

export default async function getDataLists(): Promise<DataList[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

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
