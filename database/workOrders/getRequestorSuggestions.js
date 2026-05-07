import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function doGetRequestorSuggestions(searchString, user) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('searchString', searchString)
        .input('userName', user?.userName)
        .query(`
      SELECT DISTINCT
        requestorName,
        requestorContactInfo,
        source,
        recordUpdate_dateTime
      FROM
        (
          SELECT DISTINCT
            w.requestorName,
            w.requestorContactInfo,
            1 AS source,
            w.recordUpdate_dateTime
          FROM
            ShiftLog.WorkOrders w
            LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          WHERE
            w.instance = @instance
            AND w.recordDelete_dateTime IS NULL
            AND w.requestorName LIKE '%' + @searchString + '%'
            AND w.requestorContactInfo <> '' ${user === undefined
        ? ''
        : `
                  AND (
                    wType.userGroupId IS NULL
                    OR wType.userGroupId IN (
                      SELECT
                        userGroupId
                      FROM
                        ShiftLog.UserGroupMembers
                      WHERE
                        userName = @userName
                    )
                  )
                `}
          UNION
          SELECT DISTINCT
            firstName + ' ' + lastName AS requestorName,
            CASE
              WHEN emailAddress IS NOT NULL
              AND emailAddress <> '' THEN emailAddress
              WHEN phoneNumber IS NOT NULL
              AND phoneNumber <> '' THEN phoneNumber
              WHEN phoneNumberAlternate IS NOT NULL
              AND phoneNumberAlternate <> '' THEN phoneNumberAlternate
            END AS requestorContactInfo,
            0 AS source,
            recordUpdate_dateTime
          FROM
            ShiftLog.Employees
          WHERE
            instance = @instance
            AND recordDelete_dateTime IS NULL
            AND firstName + ' ' + lastName LIKE '%' + @searchString + '%'
            AND firstName + ' ' + lastName NOT IN (
              SELECT
                requestorName
              FROM
                ShiftLog.WorkOrders
              WHERE
                instance = @instance
                AND recordDelete_dateTime IS NULL
            ) ${user === undefined
        ? ''
        : `
                  AND (
                    userGroupId IS NULL
                    OR userGroupId IN (
                      SELECT
                        userGroupId
                      FROM
                        ShiftLog.UserGroupMembers
                      WHERE
                        userName = @userName
                    )
                  )
                `}
        ) AS t
      WHERE
        requestorContactInfo IS NOT NULL
      ORDER BY
        requestorName,
        source DESC,
        recordUpdate_dateTime DESC
    `);
    const uniqueRequestors = new Map();
    for (const row of result.recordset) {
        if (!uniqueRequestors.has(row.requestorName)) {
            uniqueRequestors.set(row.requestorName, {
                requestorContactInfo: row.requestorContactInfo,
                requestorName: row.requestorName
            });
        }
    }
    return [...uniqueRequestors.values()];
}
