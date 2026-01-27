import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { DataListItem } from '../../types/record.types.js'

export default async function getOrAddDataListItemId(
  dataListKey: string,
  dataListItem: string,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const dataListItems = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('dataListKey', dataListKey)
    .input('dataListItem', dataListItem)
    .query<DataListItem>(/* sql */ `
      SELECT
        TOP 1 dataListItemId,
        dataListKey,
        dataListItem,
        userGroupId,
        orderNumber,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime,
        recordDelete_userName,
        recordDelete_dateTime
      FROM
        ShiftLog.DataListItems
      WHERE
        instance = @instance
        AND dataListKey = @dataListKey
        AND dataListItem = @dataListItem
    `)

  if (dataListItems.recordset.length > 0) {
    const existingDataListItem = dataListItems.recordset[0]

    if (existingDataListItem.recordDelete_dateTime !== null) {
      await pool
        .request()
        .input('dataListItemId', existingDataListItem.dataListItemId)
        .input('userName', userName)
        .query(/* sql */ `
          UPDATE ShiftLog.DataListItems
          SET
            recordUpdate_userName = @userName,
            recordUpdate_dateTime = getutcdate(),
            recordDelete_userName = NULL,
            recordDelete_dateTime = NULL
          WHERE
            dataListItemId = @dataListItemId
        `)
    }

    return existingDataListItem.dataListItemId
  }

  const insertResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('dataListKey', dataListKey)
    .input('dataListItem', dataListItem)
    .input('userName', userName)
    .query<{ dataListItemId: number }>(/* sql */ `
      INSERT INTO
        ShiftLog.DataListItems (
          instance,
          dataListKey,
          dataListItem,
          orderNumber,
          recordCreate_userName,
          recordUpdate_userName
        )
      SELECT
        @instance,
        @dataListKey,
        @dataListItem,
        coalesce(max(orderNumber) + 1, 0),
        @userName,
        @userName
      FROM
        ShiftLog.DataListItems
      WHERE
        dataListKey = @dataListKey
        AND recordDelete_dateTime IS NULL;

      SELECT
        SCOPE_IDENTITY() AS dataListItemId;
    `)

  return insertResult.recordset[0].dataListItemId
}
