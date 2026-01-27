import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getDataListItems(dataListKey, userName) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const dataListItemsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('dataListKey', dataListKey)
        .input('userName', userName)
        .query(/* sql */ `
      SELECT
        i.dataListItemId,
        i.dataListKey,
        i.dataListItem
      FROM
        ShiftLog.DataListItems i
      WHERE
        i.instance = @instance
        AND i.dataListKey = @dataListKey
        AND i.recordDelete_dateTime IS NULL ${userName === undefined
        ? ''
        : /* sql */ `
              AND (
                i.userGroupId IS NULL
                OR i.userGroupId IN (
                  SELECT
                    userGroupId
                  FROM
                    ShiftLog.UserGroupMembers
                  WHERE
                    userName = @userName
                )
              )
            `}
      ORDER BY
        i.orderNumber,
        i.dataListItem
    `);
    return dataListItemsResult.recordset;
}
